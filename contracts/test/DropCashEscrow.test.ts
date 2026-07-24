import { expect } from "chai";
import { ethers } from "hardhat";
import { DropCashEscrow } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

function id(s: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(s));
}

function codeHash(s: string): string {
  return ethers.solidityPackedKeccak256(["string"], [s]);
}

const ONE = ethers.parseEther("1.0");
const HALF = ethers.parseEther("0.5");

describe("DropCashEscrow", () => {
  let escrow: DropCashEscrow;
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;
  let carol: HardhatEthersSigner;

  beforeEach(async () => {
    [alice, bob, carol] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("DropCashEscrow");
    escrow = await Factory.deploy() as DropCashEscrow;
  });

  // ─── create ────────────────────────────────────────────────────────────────

  describe("create()", () => {
    it("stores escrow and emits Created", async () => {
      const linkId = id("link-1");
      const hash   = codeHash("secret");

      await expect(
        escrow.connect(alice).create(linkId, hash, 0, { value: ONE })
      ).to.emit(escrow, "Created").withArgs(linkId, alice.address, ONE, 0n);

      const e = await escrow.getEscrow(linkId);
      expect(e.sender).to.equal(alice.address);
      expect(e.amount).to.equal(ONE);
      expect(e.claimed).to.be.false;
      expect(e.cancelled).to.be.false;
    });

    it("reverts ZeroAmount when no value sent", async () => {
      await expect(
        escrow.connect(alice).create(id("link-z"), codeHash("x"), 0, { value: 0n })
      ).to.be.revertedWithCustomError(escrow, "ZeroAmount");
    });

    it("reverts AlreadyExists on duplicate linkId", async () => {
      const linkId = id("link-dup");
      await escrow.connect(alice).create(linkId, codeHash("a"), 0, { value: ONE });
      await expect(
        escrow.connect(alice).create(linkId, codeHash("b"), 0, { value: ONE })
      ).to.be.revertedWithCustomError(escrow, "AlreadyExists");
    });
  });

  // ─── claim ─────────────────────────────────────────────────────────────────

  describe("claim()", () => {
    let linkId: string;

    beforeEach(async () => {
      linkId = id("link-claim");
      await escrow.connect(alice).create(linkId, codeHash("mycode"), 0, { value: ONE });
    });

    it("pays recipient and emits Claimed", async () => {
      const before = await ethers.provider.getBalance(bob.address);
      await expect(
        escrow.connect(carol).claim(linkId, "mycode", bob.address)
      ).to.emit(escrow, "Claimed").withArgs(linkId, bob.address, ONE);

      const after = await ethers.provider.getBalance(bob.address);
      expect(after - before).to.equal(ONE);

      const e = await escrow.getEscrow(linkId);
      expect(e.claimed).to.be.true;
    });

    it("reverts NotFound for unknown linkId", async () => {
      await expect(
        escrow.claim(id("no-such"), "code", bob.address)
      ).to.be.revertedWithCustomError(escrow, "NotFound");
    });

    it("reverts InvalidCode for wrong code", async () => {
      await expect(
        escrow.claim(linkId, "wrongcode", bob.address)
      ).to.be.revertedWithCustomError(escrow, "InvalidCode");
    });

    it("reverts AlreadyClaimed on double claim", async () => {
      await escrow.claim(linkId, "mycode", bob.address);
      await expect(
        escrow.claim(linkId, "mycode", bob.address)
      ).to.be.revertedWithCustomError(escrow, "AlreadyClaimed");
    });

    it("reverts Expired when past expiry", async () => {
      const now = Math.floor(Date.now() / 1000);
      const expiredId = id("link-exp");
      await escrow.connect(alice).create(expiredId, codeHash("code"), now - 1, { value: ONE });
      await expect(
        escrow.claim(expiredId, "code", bob.address)
      ).to.be.revertedWithCustomError(escrow, "Expired");
    });

    it("succeeds with future expiry", async () => {
      const future = Math.floor(Date.now() / 1000) + 3600;
      const futureId = id("link-future");
      await escrow.connect(alice).create(futureId, codeHash("fut"), future, { value: HALF });
      await expect(
        escrow.claim(futureId, "fut", carol.address)
      ).to.emit(escrow, "Claimed");
    });

    it("reverts AlreadyCancelled after cancel", async () => {
      await escrow.connect(alice).cancel(linkId);
      await expect(
        escrow.claim(linkId, "mycode", bob.address)
      ).to.be.revertedWithCustomError(escrow, "AlreadyCancelled");
    });
  });

  // ─── cancel ────────────────────────────────────────────────────────────────

  describe("cancel()", () => {
    let linkId: string;

    beforeEach(async () => {
      linkId = id("link-cancel");
      await escrow.connect(alice).create(linkId, codeHash("c"), 0, { value: ONE });
    });

    it("refunds sender and emits Cancelled", async () => {
      const before = await ethers.provider.getBalance(alice.address);
      const tx = await escrow.connect(alice).cancel(linkId);
      const receipt = await tx.wait();
      const gas = receipt!.gasUsed * receipt!.gasPrice;
      const after = await ethers.provider.getBalance(alice.address);

      expect(after).to.be.closeTo(before + ONE - gas, ethers.parseEther("0.001"));

      await expect(tx).to.emit(escrow, "Cancelled").withArgs(linkId, alice.address, ONE);

      const e = await escrow.getEscrow(linkId);
      expect(e.cancelled).to.be.true;
    });

    it("reverts NotSender for non-creator", async () => {
      await expect(
        escrow.connect(bob).cancel(linkId)
      ).to.be.revertedWithCustomError(escrow, "NotSender");
    });

    it("reverts AlreadyClaimed after claim", async () => {
      await escrow.claim(linkId, "c", carol.address);
      await expect(
        escrow.connect(alice).cancel(linkId)
      ).to.be.revertedWithCustomError(escrow, "AlreadyClaimed");
    });

    it("reverts AlreadyCancelled on double cancel", async () => {
      await escrow.connect(alice).cancel(linkId);
      await expect(
        escrow.connect(alice).cancel(linkId)
      ).to.be.revertedWithCustomError(escrow, "AlreadyCancelled");
    });
  });

  // ─── getEscrow ─────────────────────────────────────────────────────────────

  describe("getEscrow()", () => {
    it("returns zero values for unknown linkId", async () => {
      const e = await escrow.getEscrow(id("nonexistent"));
      expect(e.sender).to.equal(ethers.ZeroAddress);
      expect(e.amount).to.equal(0n);
    });
  });
});