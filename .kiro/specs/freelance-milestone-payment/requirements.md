# Requirements Document

## Introduction

This document specifies the requirements for a milestone-based payment system for freelance projects. The system enables secure, staged payments where both client (HR) and freelancer must confirm milestone completion before payment is released, with the server acting as an escrow service to hold funds until work is verified.

## Glossary

- **Client**: The HR or company representative who posts freelance projects and makes payments
- **Freelancer**: The individual who applies for and completes freelance project work
- **Milestone**: A defined stage or deliverable in a freelance project with associated payment amount
- **Escrow Service**: The server-side system that holds client funds until milestone conditions are met
- **Payment System**: The backend service that processes and tracks milestone payments
- **Notification Service**: The system component that sends payment status updates to users

## Requirements

### Requirement 1

**User Story:** As a client, I want to deposit the full project amount into escrow when accepting a freelancer, so that the freelancer has confidence they will be paid upon completing milestones.

#### Acceptance Criteria

1. WHEN a client accepts a freelancer for a project THEN the Payment System SHALL require the client to deposit the full project budget into escrow
2. WHEN the deposit transaction completes THEN the Escrow Service SHALL lock the funds and prevent client withdrawal
3. WHEN funds are deposited THEN the Notification Service SHALL notify the freelancer that project funds are secured
4. WHEN the deposit fails THEN the Payment System SHALL prevent project activation and notify the client
5. WHEN viewing project details THEN the Payment System SHALL display the total escrowed amount and remaining balance

### Requirement 2

**User Story:** As a freelancer, I want to mark milestones as complete and request client approval, so that I can receive payment for completed work.

#### Acceptance Criteria

1. WHEN a freelancer completes milestone work THEN the Payment System SHALL allow the freelancer to submit the milestone for client review
2. WHEN a milestone is submitted THEN the Notification Service SHALL notify the client to review and approve the milestone
3. WHEN a milestone is submitted THEN the Payment System SHALL update the milestone status to "pending_client_approval"
4. WHEN a freelancer attempts to submit an already-submitted milestone THEN the Payment System SHALL reject the request
5. WHEN viewing milestone status THEN the Payment System SHALL display submission timestamp and current approval state

### Requirement 3

**User Story:** As a client, I want to review and approve completed milestones, so that I can verify work quality before payment is released.

#### Acceptance Criteria

1. WHEN a client reviews a submitted milestone THEN the Payment System SHALL allow the client to approve or reject with feedback
2. WHEN a client approves a milestone THEN the Payment System SHALL update the milestone status to "client_approved"
3. WHEN a client rejects a milestone THEN the Payment System SHALL update status to "revision_requested" and include rejection reason
4. WHEN a milestone is approved THEN the Notification Service SHALL notify the freelancer of approval
5. WHEN a milestone is rejected THEN the Notification Service SHALL notify the freelancer with rejection details

### Requirement 4

**User Story:** As a freelancer, I want to confirm receipt of milestone payments, so that I can acknowledge payment and continue work on subsequent milestones.

#### Acceptance Criteria

1. WHEN a client approves a milestone THEN the Payment System SHALL release the milestone payment amount from escrow to the freelancer account
2. WHEN payment is released THEN the Notification Service SHALL notify the freelancer that funds are available
3. WHEN a freelancer receives payment notification THEN the Payment System SHALL require the freelancer to confirm payment receipt
4. WHEN a freelancer confirms payment receipt THEN the Payment System SHALL update milestone status to "payment_confirmed"
5. WHEN a freelancer confirms payment THEN the Payment System SHALL unlock the next milestone for work

### Requirement 5

**User Story:** As a freelancer, I want to be blocked from starting subsequent milestones until I confirm payment receipt, so that payment disputes are resolved before continuing work.

#### Acceptance Criteria

1. WHEN a milestone payment is released THEN the Payment System SHALL block the freelancer from submitting subsequent milestones
2. WHILE payment confirmation is pending THEN the Payment System SHALL prevent freelancer submission of any later milestone
3. WHEN a freelancer confirms payment receipt THEN the Payment System SHALL unblock the next sequential milestone
4. WHEN a freelancer attempts to submit a blocked milestone THEN the Payment System SHALL return an error indicating payment confirmation is required
5. WHEN viewing project progress THEN the Payment System SHALL display which milestones are blocked pending payment confirmation

### Requirement 6

**User Story:** As a client, I want the escrow service to hold remaining funds securely, so that I maintain control over unpaid milestones while ensuring freelancer payment security.

#### Acceptance Criteria

1. WHEN a milestone payment is released THEN the Escrow Service SHALL deduct the milestone amount from the total escrowed balance
2. WHEN calculating remaining escrow THEN the Escrow Service SHALL sum all unpaid milestone amounts
3. WHEN all milestones are paid THEN the Escrow Service SHALL release any remaining funds back to the client
4. WHEN viewing escrow status THEN the Payment System SHALL display total deposited, total paid, and remaining balance
5. WHEN a project is cancelled THEN the Escrow Service SHALL return unpaid milestone funds to the client according to cancellation policy

### Requirement 7

**User Story:** As a system administrator, I want all payment transactions to be logged and auditable, so that disputes can be resolved with clear transaction history.

#### Acceptance Criteria

1. WHEN any payment transaction occurs THEN the Payment System SHALL create an immutable transaction record with timestamp
2. WHEN a transaction is recorded THEN the Payment System SHALL include transaction type, amount, parties involved, and milestone reference
3. WHEN a user requests transaction history THEN the Payment System SHALL return all transactions in chronological order
4. WHEN a dispute occurs THEN the Payment System SHALL provide complete audit trail for the disputed milestone
5. WHEN viewing transaction logs THEN the Payment System SHALL display all state changes for each milestone payment

### Requirement 8

**User Story:** As a freelancer, I want to receive notifications at each payment stage, so that I stay informed about payment status without constantly checking the platform.

#### Acceptance Criteria

1. WHEN a client deposits escrow funds THEN the Notification Service SHALL send a notification to the freelancer
2. WHEN a client approves a milestone THEN the Notification Service SHALL send a payment released notification to the freelancer
3. WHEN payment is transferred to freelancer account THEN the Notification Service SHALL send a payment received notification
4. WHEN a client rejects a milestone THEN the Notification Service SHALL send a revision request notification to the freelancer
5. WHEN the freelancer confirms payment THEN the Notification Service SHALL send a confirmation acknowledgment

### Requirement 9

**User Story:** As a client, I want to receive notifications when freelancers submit milestones and confirm payments, so that I can take timely action on approvals.

#### Acceptance Criteria

1. WHEN a freelancer submits a milestone THEN the Notification Service SHALL send a review request notification to the client
2. WHEN a freelancer confirms payment receipt THEN the Notification Service SHALL send a confirmation notification to the client
3. WHEN a milestone deadline approaches THEN the Notification Service SHALL send a reminder notification to both parties
4. WHEN all milestones are completed THEN the Notification Service SHALL send a project completion notification to the client
5. WHEN escrow funds are returned THEN the Notification Service SHALL send a refund notification to the client
