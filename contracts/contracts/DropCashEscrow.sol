// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DropCashEscrow
 * @notice Trustless escrow for HushCash Drop Cash links.
 *
 * Flow:
 *   1. Sender calls create(linkId, codeHash) with native USDC attached.
 *   2. Sender shares the plain code via the hushcash.xyz/claim/... link.
 *   3. Recipient calls claim(linkId, code, recipient) — contract verifies
 *      keccak256(code) == codeHash and releases funds.
 *   4. Sender can cancel() at any time before the link is claimed.
 *
 * Native USDC on Arc acts as the native gas token (like ETH on Ethereum),
 * so no ERC-20 approval is needed — funds are sent with msg.value.
 */
contract DropCashEscrow {
    struct Escrow {
        address payable sender;
        uint256 amount;
        bytes32 codeHash;
        bool claimed;
        bool cancelled;
        uint256 expiresAt; // unix timestamp, 0 = no expiry
    }

    mapping(bytes32 => Escrow) public escrows;

    event Created(bytes32 indexed linkId, address indexed sender, uint256 amount, uint256 expiresAt);
    event Claimed(bytes32 indexed linkId, address indexed recipient, uint256 amount);
    event Cancelled(bytes32 indexed linkId, address indexed sender, uint256 amount);

    error NotFound();
    error AlreadyClaimed();
    error AlreadyCancelled();
    error Expired();
    error InvalidCode();
    error NotSender();
    error AlreadyExists();
    error ZeroAmount();

    function create(bytes32 linkId, bytes32 codeHash, uint256 expiresAt) external payable {
        if (msg.value == 0) revert ZeroAmount();
        if (escrows[linkId].amount != 0) revert AlreadyExists();

        escrows[linkId] = Escrow({
            sender: payable(msg.sender),
            amount: msg.value,
            codeHash: codeHash,
            claimed: false,
            cancelled: false,
            expiresAt: expiresAt
        });

        emit Created(linkId, msg.sender, msg.value, expiresAt);
    }

    function claim(bytes32 linkId, string calldata code, address payable recipient) external {
        Escrow storage e = escrows[linkId];
        if (e.amount == 0) revert NotFound();
        if (e.claimed) revert AlreadyClaimed();
        if (e.cancelled) revert AlreadyCancelled();
        if (e.expiresAt != 0 && block.timestamp >= e.expiresAt) revert Expired();
        if (keccak256(abi.encodePacked(code)) != e.codeHash) revert InvalidCode();

        // Checks-Effects-Interactions: update state before transfer
        e.claimed = true;
        uint256 amount = e.amount;

        recipient.transfer(amount);

        emit Claimed(linkId, recipient, amount);
    }

    function cancel(bytes32 linkId) external {
        Escrow storage e = escrows[linkId];
        if (e.amount == 0) revert NotFound();
        if (e.sender != msg.sender) revert NotSender();
        if (e.claimed) revert AlreadyClaimed();
        if (e.cancelled) revert AlreadyCancelled();

        e.cancelled = true;
        uint256 amount = e.amount;

        e.sender.transfer(amount);

        emit Cancelled(linkId, msg.sender, amount);
    }

    function getEscrow(bytes32 linkId) external view returns (
        address sender,
        uint256 amount,
        bool claimed,
        bool cancelled,
        uint256 expiresAt
    ) {
        Escrow storage e = escrows[linkId];
        return (e.sender, e.amount, e.claimed, e.cancelled, e.expiresAt);
    }
}