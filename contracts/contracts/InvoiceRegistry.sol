// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title InvoiceRegistry
 * @notice On-chain invoice registry for HushCash.
 *
 * Flow:
 *   1. Service provider calls createInvoice(code, amount) — registers the invoice.
 *   2. Client calls payInvoice(code) with exact native USDC attached.
 *      Funds are sent directly to the creator — no escrow needed.
 *   3. Creator can cancelInvoice(code) before it is paid.
 *
 * Native USDC on Arc acts as the native gas token, so no ERC-20 approval needed.
 */
contract InvoiceRegistry {
    struct Invoice {
        address payable creator;
        uint256 amount;
        bool paid;
        bool cancelled;
        uint256 createdAt;
    }

    mapping(bytes32 => Invoice) public invoices;

    event InvoiceCreated(bytes32 indexed code, address indexed creator, uint256 amount);
    event InvoicePaid(bytes32 indexed code, address indexed payer, uint256 amount);
    event InvoiceCancelled(bytes32 indexed code, address indexed creator);

    error NotFound();
    error AlreadyExists();
    error AlreadyPaid();
    error AlreadyCancelled();
    error NotCreator();
    error WrongAmount();
    error ZeroAmount();

    function createInvoice(bytes32 code, uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        if (invoices[code].creator != address(0)) revert AlreadyExists();

        invoices[code] = Invoice({
            creator: payable(msg.sender),
            amount: amount,
            paid: false,
            cancelled: false,
            createdAt: block.timestamp
        });

        emit InvoiceCreated(code, msg.sender, amount);
    }

    function payInvoice(bytes32 code) external payable {
        Invoice storage inv = invoices[code];
        if (inv.creator == address(0)) revert NotFound();
        if (inv.paid) revert AlreadyPaid();
        if (inv.cancelled) revert AlreadyCancelled();
        if (msg.value != inv.amount) revert WrongAmount();

        inv.paid = true;
        inv.creator.transfer(msg.value);

        emit InvoicePaid(code, msg.sender, msg.value);
    }

    function cancelInvoice(bytes32 code) external {
        Invoice storage inv = invoices[code];
        if (inv.creator == address(0)) revert NotFound();
        if (inv.creator != msg.sender) revert NotCreator();
        if (inv.paid) revert AlreadyPaid();
        if (inv.cancelled) revert AlreadyCancelled();

        inv.cancelled = true;

        emit InvoiceCancelled(code, msg.sender);
    }

    function getInvoice(bytes32 code) external view returns (
        address creator,
        uint256 amount,
        bool paid,
        bool cancelled,
        uint256 createdAt
    ) {
        Invoice storage inv = invoices[code];
        return (inv.creator, inv.amount, inv.paid, inv.cancelled, inv.createdAt);
    }
}