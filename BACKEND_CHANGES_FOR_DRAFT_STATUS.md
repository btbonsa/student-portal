# Backend Changes Required for Draft Status Implementation

## Overview
The frontend has been updated to use a **DRAFT status** approach for registrations. This is more secure than localStorage and provides better data management.

## Required Backend Changes

### 1. Update Registration Status Enum

Add `DRAFT` to your registration status enum in your backend:

```python
# Example for Python (Flask/Django)
class RegistrationStatus(Enum):
    DRAFT = "DRAFT"              # New status - program selected but no payment
    PAYMENT_PENDING = "PAYMENT_PENDING"
    PAYMENT_REJECTED = "PAYMENT_REJECTED"
    REGISTERED = "REGISTERED"
```

```javascript
// Example for Node.js/Express
const RegistrationStatus = {
  DRAFT: 'DRAFT',              // New status
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAYMENT_REJECTED: 'PAYMENT_REJECTED',
  REGISTERED: 'REGISTERED'
};
```

### 2. Update Registration Creation Endpoint

When creating a new registration, set the status to `DRAFT` instead of a default status:

```python
# Python example
@router.post("/registrations")
def create_registration(program_id: int, current_user: User):
    registration = Registration(
        student_id=current_user.id,
        program_id=program_id,
        status=RegistrationStatus.DRAFT,  # Changed from PAYMENT_PENDING
        registration_number=generate_registration_number()
    )
    db.add(registration)
    db.commit()
    return registration
```

```javascript
// Node.js example
app.post('/api/registrations', authenticateToken, async (req, res) => {
  const { program_id } = req.body;
  
  const registration = await Registration.create({
    student_id: req.user.id,
    program_id: program_id,
    status: 'DRAFT',  // Changed from 'PAYMENT_PENDING'
    registration_number: generateRegistrationNumber()
  });
  
  res.json(registration);
});
```

### 3. Update Payment Upload Endpoint

When payment is uploaded, update the registration status from `DRAFT` to `PAYMENT_PENDING`:

```python
# Python example
@router.post("/payments")
def upload_payment(payment_data: PaymentUpload, current_user: User):
    # Create payment record
    payment = Payment(
        registration_id=payment_data.registration_id,
        amount=payment_data.amount,
        payment_method=payment_data.payment_method,
        transaction_reference=payment_data.transaction_reference,
        screenshot_url=upload_screenshot(payment_data.screenshot),
        status="PENDING"
    )
    db.add(payment)
    
    # Update registration status from DRAFT to PAYMENT_PENDING
    registration = db.query(Registration).filter(
        Registration.id == payment_data.registration_id
    ).first()
    
    if registration.status == RegistrationStatus.DRAFT:
        registration.status = RegistrationStatus.PAYMENT_PENDING
    
    db.commit()
    return payment
```

```javascript
// Node.js example
app.post('/api/payments', authenticateToken, async (req, res) => {
  const { registration_id, amount, payment_method, transaction_reference, screenshot } = req.body;
  
  // Create payment record
  const payment = await Payment.create({
    registration_id,
    amount,
    payment_method,
    transaction_reference,
    screenshot_url: await uploadScreenshot(screenshot),
    status: 'PENDING'
  });
  
  // Update registration status from DRAFT to PAYMENT_PENDING
  const registration = await Registration.findByPk(registration_id);
  if (registration.status === 'DRAFT') {
    await registration.update({ status: 'PAYMENT_PENDING' });
  }
  
  res.json(payment);
});
```

### 4. Update Get My Registration Endpoint

Ensure the endpoint returns registrations with `DRAFT` status (it should already, but verify):

```python
# Python example
@router.get("/registrations/my")
def get_my_registration(current_user: User):
    registration = db.query(Registration).filter(
        Registration.student_id == current_user.id
    ).order_by(Registration.created_at.desc()).first()
    
    if not registration:
        raise HTTPException(status_code=404, detail="No registration found")
    
    return registration  # Will return DRAFT status if applicable
```

### 5. Add Draft Cleanup Job (Optional but Recommended)

Create a scheduled task to delete draft registrations older than 48 hours:

```python
# Python example with Celery/APScheduler
@celery.task
def cleanup_old_drafts():
    """Delete draft registrations older than 48 hours"""
    cutoff_time = datetime.now() - timedelta(hours=48)
    
    old_drafts = db.query(Registration).filter(
        Registration.status == RegistrationStatus.DRAFT,
        Registration.created_at < cutoff_time
    ).all()
    
    for draft in old_drafts:
        db.delete(draft)
    
    db.commit()
    print(f"Deleted {len(old_drafts)} old draft registrations")
```

```javascript
// Node.js example with node-cron
const cron = require('node-cron');

cron.schedule('0 */6 * * *', async () => {
  // Run every 6 hours
  const cutoffTime = new Date(Date.now() - 48 * 60 * 60 * 1000);
  
  const result = await Registration.destroy({
    where: {
      status: 'DRAFT',
      created_at: { [Op.lt]: cutoffTime }
    }
  });
  
  console.log(`Deleted ${result} old draft registrations`);
});
```

## Frontend Behavior (Already Implemented)

✅ **Program Selection:**
- User selects program → Registration created with `DRAFT` status
- User redirected to payment page

✅ **Payment Page:**
- If registration has `DRAFT` status → Show payment form
- User uploads payment → Backend updates status to `PAYMENT_PENDING`

✅ **Cleanup:**
- If user never uploads payment → Draft stays in DB
- Backend cleanup job deletes old drafts (optional)

## Security Benefits

✅ **Server-side storage** - No XSS vulnerabilities
✅ **Authentication required** - Only logged-in users
✅ **Audit trail** - Track all registration changes
✅ **Business intelligence** - Analyze abandoned registrations
✅ **Clean database** - Scheduled cleanup of old drafts

## Testing Checklist

- [ ] Create registration returns `DRAFT` status
- [ ] Payment upload updates status from `DRAFT` to `PAYMENT_PENDING`
- [ ] Get my registration returns `DRAFT` status
- [ ] Draft cleanup job works correctly
- [ ] Frontend displays DRAFT registration correctly
- [ ] Frontend allows payment upload for DRAFT status

## Migration Notes

If you have existing registrations in your database, they will have their current status (not DRAFT). New registrations will use DRAFT status. No data migration is needed.
