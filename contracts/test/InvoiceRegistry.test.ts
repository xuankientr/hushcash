import { expect } from "chai";
import { ethers } from "hardhat";
import { InvoiceRegistry } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

function code(s: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(s));
}

const ONE  = ethers.parseEther("1.0");
const TWO  = ethers.parseEther("2.0");
const HALF = ethers.parseEther("0.5");

describe("InvoiceRegistry", () => {
  let registry: InvoiceRegistry;
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;
  let carol: HardhatEthersSigner;

  beforeEach(async () => {
    [alice, bob, carol] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("InvoiceRegistry");
    registry = await Factory.deploy() as InvoiceRegistry;
  });

  // ─── createInvoice ─────────────────────────────────────────────────────────

  describe("createInvoice()", () => {
    it("stores invoice and emits InvoiceCreated", async () => {
      const c = code("inv-1");
      await expect(
        registry.connect(alice).createInvoice(c, ONE)
      ).to.emit(registry, "InvoiceCreated").withArgs(c, alice.address, ONE);

      const inv = await registry.getInvoice(c);
      expect(inv.creator).to.equal(alice.address);
      expect(inv.amount).to.equal(ONE);
      expect(inv.paid).to.be.false;
      expect(inv.cancelled).to.be.false;
      expect(inv.createdAt).to.be.gt(0n);
    });

    it("reverts ZeroAmount", async () => {
      await expect(
        registry.createInvoice(code("inv-z"), 0n)
      ).to.be.revertedWithCustomError(registry, "ZeroAmount");
    });

    it("reverts AlreadyExists on duplicate code", async () => {
      const c = code("inv-dup");
      await registry.connect(alice).createInvoice(c, ONE);
      await expect(
        registry.connect(alice).createInvoice(c, TWO)
      ).to.be.revertedWithCustomError(registry, "AlreadyExists");
    });

    it("allows different signers to create with different codes", async () => {
      await registry.connect(alice).createInvoice(code("inv-a"), ONE);
      await registry.connect(bob).createInvoice(code("inv-b"), TWO);

      const a = await registry.getInvoice(code("inv-a"));
      const b = await registry.getInvoice(code("inv-b"));
      expect(a.creator).to.equal(alice.address);
      expect(b.creator).to.equal(bob.address);
    });
  });

  // ─── payInvoice ────────────────────────────────────────────────────────────

  describe("payInvoice()", () => {
    let c: string;

    beforeEach(async () => {
      c = code("inv-pay");
      await registry.connect(alice).createInvoice(c, ONE);
    });

    it("transfers exact amount to creator and emits InvoicePaid", async () => {
      const before = await ethers.provider.getBalance(alice.address);

      await expect(
        registry.connect(bob).payInvoice(c, { value: ONE })
      ).to.emit(registry, "InvoicePaid").withArgs(c, bob.address, ONE);

      const after = await ethers.provider.getBalance(alice.address);
      expect(after - before).to.equal(ONE);

      const inv = await registry.getInvoice(c);
      expect(inv.paid).to.be.true;
    });

    it("reverts NotFound for unknown code", async () => {
      await expect(
        registry.payInvoice(code("no-such"), { value: ONE })
      ).to.be.revertedWithCustomError(registry, "NotFound");
    });

    it("reverts WrongAmount when too little sent", async () => {
      await expect(
        registry.connect(bob).payInvoice(c, { value: HALF })
      ).to.be.revertedWithCustomError(registry, "WrongAmount");
    });

    it("reverts WrongAmount when too much sent", async () => {
      await expect(
        registry.connect(bob).payInvoice(c, { value: TWO })
      ).to.be.revertedWithCustomError(registry, "WrongAmount");
    });

    it("reverts AlreadyPaid on double payment", async () => {
      await registry.connect(bob).payInvoice(c, { value: ONE });
      await expect(
        registry.connect(carol).payInvoice(c, { value: ONE })
      ).to.be.revertedWithCustomError(registry, "AlreadyPaid");
    });

    it("reverts AlreadyCancelled after cancel", async () => {
      await registry.connect(alice).cancelInvoice(c);
      await expect(
        registry.connect(bob).payInvoice(c, { value: ONE })
      ).to.be.revertedWithCustomError(registry, "AlreadyCancelled");
    });

    it("creator can pay their own invoice", async () => {
      await expect(
        registry.connect(alice).payInvoice(c, { value: ONE })
      ).to.emit(registry, "InvoicePaid");
    });
  });

  // ─── cancelInvoice ─────────────────────────────────────────────────────────

  describe("cancelInvoice()", () => {
    let c: string;

    beforeEach(async () => {
      c = code("inv-cancel");
      await registry.connect(alice).createInvoice(c, ONE);
    });

    it("cancels and emits InvoiceCancelled", async () => {
      await expect(
        registry.connect(alice).cancelInvoice(c)
      ).to.emit(registry, "InvoiceCancelled").withArgs(c, alice.address);

      const inv = await registry.getInvoice(c);
      expect(inv.cancelled).to.be.true;
    });

    it("reverts NotFound for unknown code", async () => {
      await expect(
        registry.cancelInvoice(code("ghost"))
      ).to.be.revertedWithCustomError(registry, "NotFound");
    });

    it("reverts NotCreator for non-owner", async () => {
      await expect(
        registry.connect(bob).cancelInvoice(c)
      ).to.be.revertedWithCustomError(registry, "NotCreator");
    });

    it("reverts AlreadyPaid after payment", async () => {
      await registry.connect(bob).payInvoice(c, { value: ONE });
      await expect(
        registry.connect(alice).cancelInvoice(c)
      ).to.be.revertedWithCustomError(registry, "AlreadyPaid");
    });

    it("reverts AlreadyCancelled on double cancel", async () => {
      await registry.connect(alice).cancelInvoice(c);
      await expect(
        registry.connect(alice).cancelInvoice(c)
      ).to.be.revertedWithCustomError(registry, "AlreadyCancelled");
    });
  });

  // ─── getInvoice ────────────────────────────────────────────────────────────

  describe("getInvoice()", () => {
    it("returns zero values for unknown code", async () => {
      const inv = await registry.getInvoice(code("empty"));
      expect(inv.creator).to.equal(ethers.ZeroAddress);
      expect(inv.amount).to.equal(0n);
      expect(inv.paid).to.be.false;
      expect(inv.cancelled).to.be.false;
    });
  });
});