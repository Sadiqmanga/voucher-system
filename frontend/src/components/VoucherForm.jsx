import { useState, useEffect } from 'react';

function VoucherForm({ onSubmit, onCancel, initialData = {}, user }) {
  const [formData, setFormData] = useState({
    voucher_number: initialData.voucher_number || '',
    date: initialData.date || '',
    in_favour_of: initialData.in_favour_of || '',
    items: initialData.items || [{ route: '', no_of_trips: '', trip_rate: '', total: '' }],
    subtotal: initialData.subtotal || '',
    prev_balance: initialData.prev_balance || '',
    advance_paid: initialData.advance_paid || '',
    total_cost_shortage: initialData.total_cost_shortage || '',
    total_cost_repacking: initialData.total_cost_repacking || '',
    total_due: initialData.total_due || '',
    pay_mode: initialData.pay_mode || 'bank',
    bank_details: {
      type: initialData.bank_details?.type || 'CHQ/TRF',
      account_name: initialData.bank_details?.account_name || '',
      account_number: initialData.bank_details?.account_number || ''
    },
    date_of_payment: initialData.date_of_payment || '',
    prepared_by: initialData.prepared_by || '',
    approved_by: initialData.approved_by || ''
  });

  const [loadingVoucherNumber, setLoadingVoucherNumber] = useState(false);

  // Auto-generate voucher number and date on mount
  useEffect(() => {
    if (!initialData.voucher_number) {
      fetchNextVoucherNumber();
    }
    if (!initialData.date) {
      generateDate();
    }
  }, []);

  const fetchNextVoucherNumber = async () => {
    try {
      setLoadingVoucherNumber(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/vouchers/next-number', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, voucher_number: data.voucher_number }));
      }
    } catch (error) {
      console.error('Error fetching voucher number:', error);
    } finally {
      setLoadingVoucherNumber(false);
    }
  };

  const generateDate = () => {
    const today = new Date();
    // Convert to Nigerian time (UTC+1)
    const nigerianDate = new Date(today.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
    const day = String(nigerianDate.getDate()).padStart(2, '0');
    const month = String(nigerianDate.getMonth() + 1).padStart(2, '0');
    const year = String(nigerianDate.getFullYear()).slice(-2);
    const formattedDate = `${day}/${month}/${year}`;
    setFormData(prev => ({ ...prev, date: formattedDate }));
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { route: '', no_of_trips: '', trip_rate: '', total: '' }]
    });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate total if trip_rate and no_of_trips are provided
    if (field === 'trip_rate' || field === 'no_of_trips') {
      const tripRate = field === 'trip_rate' ? parseFloat(value) || 0 : parseFloat(newItems[index].trip_rate) || 0;
      const noOfTrips = field === 'no_of_trips' ? parseFloat(value) || 0 : parseFloat(newItems[index].no_of_trips) || 0;
      newItems[index].total = tripRate * noOfTrips;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.voucher_number || !formData.date || !formData.in_favour_of) {
      alert('Please fill in all required fields (Voucher Number, Date, and In Favour Of)');
      return;
    }
    
    // Convert items to proper format
    const processedItems = formData.items.map(item => ({
      route: item.route,
      no_of_trips: item.no_of_trips ? parseFloat(item.no_of_trips) : null,
      trip_rate: item.trip_rate ? parseFloat(item.trip_rate) : null,
      total: item.total ? parseFloat(item.total) : null
    }));

    // Create voucher_data without voucher_number (it's sent separately)
    const { voucher_number, ...voucherDataWithoutNumber } = formData;
    
    const processedData = {
      ...voucherDataWithoutNumber,
      items: processedItems,
      subtotal: formData.subtotal ? parseFloat(formData.subtotal) : null,
      prev_balance: formData.prev_balance ? parseFloat(formData.prev_balance) : null,
      advance_paid: formData.advance_paid ? parseFloat(formData.advance_paid) : null,
      total_cost_shortage: formData.total_cost_shortage ? parseFloat(formData.total_cost_shortage) : null,
      total_cost_repacking: formData.total_cost_repacking ? parseFloat(formData.total_cost_repacking) : null,
      total_due: formData.total_due ? parseFloat(formData.total_due) : null
    };

    // Pass both voucher_number and processed data
    onSubmit(formData.voucher_number, processedData);
  };

  return (
    <form onSubmit={handleSubmit} className="voucher-form">
      <div className="form-section">
        <h3 className="section-title">Voucher Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Voucher Number *</label>
            <input
              type="text"
              value={formData.voucher_number}
              onChange={(e) => setFormData({ ...formData, voucher_number: e.target.value })}
              required
              disabled={loadingVoucherNumber}
              className="form-input"
              style={{ backgroundColor: loadingVoucherNumber ? '#f5f5f5' : 'white' }}
            />
            {loadingVoucherNumber && <small className="form-hint">Generating...</small>}
          </div>
          <div className="form-group">
            <label>Date *</label>
            <input
              type="text"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label>In Favour Of (IFO) *</label>
          <input
            type="text"
            value={formData.in_favour_of}
            onChange={(e) => setFormData({ ...formData, in_favour_of: e.target.value })}
            required
            className="form-input"
          />
        </div>
      </div>

      <div className="form-section">
        <div className="section-header">
          <h3 className="section-title">Itemized Details</h3>
          <button type="button" onClick={addItem} className="btn-add-item">
            <span className="icon-plus">+</span> Add Item
          </button>
        </div>
        <div className="items-container">
          {formData.items.map((item, index) => (
            <div key={index} className="item-row">
              <input
                type="text"
                placeholder="Route"
                value={item.route}
                onChange={(e) => updateItem(index, 'route', e.target.value)}
                required
                className="form-input"
              />
              <input
                type="number"
                placeholder="No. of Trips"
                value={item.no_of_trips}
                onChange={(e) => updateItem(index, 'no_of_trips', e.target.value)}
                className="form-input"
                min="0"
                step="1"
              />
              <input
                type="number"
                placeholder="Trip Rate (₦)"
                value={item.trip_rate}
                onChange={(e) => updateItem(index, 'trip_rate', e.target.value)}
                className="form-input"
                min="0"
                step="0.01"
              />
              <input
                type="number"
                placeholder="Total (₦)"
                value={item.total}
                readOnly
                className="form-input form-input-readonly"
              />
              {formData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="btn-remove-item"
                  title="Remove item"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Financial Summary</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Subtotal (₦)</label>
            <input
              type="number"
              value={formData.subtotal}
              onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })}
              className="form-input"
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>Previous Balance (₦)</label>
            <input
              type="number"
              value={formData.prev_balance}
              onChange={(e) => setFormData({ ...formData, prev_balance: e.target.value })}
              className="form-input"
              min="0"
              step="0.01"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Advance Paid (₦) *</label>
            <input
              type="number"
              value={formData.advance_paid}
              onChange={(e) => setFormData({ ...formData, advance_paid: e.target.value })}
              required
              className="form-input form-input-highlight"
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>Total Cost of Shortage (₦)</label>
            <input
              type="number"
              value={formData.total_cost_shortage}
              onChange={(e) => setFormData({ ...formData, total_cost_shortage: e.target.value })}
              className="form-input"
              min="0"
              step="0.01"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Total Cost of Repacking (₦)</label>
            <input
              type="number"
              value={formData.total_cost_repacking}
              onChange={(e) => setFormData({ ...formData, total_cost_repacking: e.target.value })}
              className="form-input"
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>Total Due (₦)</label>
            <input
              type="number"
              value={formData.total_due}
              onChange={(e) => setFormData({ ...formData, total_due: e.target.value })}
              className="form-input"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Payment Information</h3>
        <div className="form-group">
          <label>Pay Mode *</label>
          <select
            value={formData.pay_mode}
            onChange={(e) => setFormData({ ...formData, pay_mode: e.target.value })}
            required
            className="form-select"
          >
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
          </select>
        </div>
        {formData.pay_mode === 'bank' && (
          <>
            <div className="form-group">
              <label>Bank Type</label>
              <input
                type="text"
                value={formData.bank_details.type}
                onChange={(e) => setFormData({
                  ...formData,
                  bank_details: { ...formData.bank_details, type: e.target.value }
                })}
                className="form-input"
                placeholder="CHQ/TRF"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Account Name *</label>
                <input
                  type="text"
                  value={formData.bank_details.account_name}
                  onChange={(e) => setFormData({
                    ...formData,
                    bank_details: { ...formData.bank_details, account_name: e.target.value }
                  })}
                  required={formData.pay_mode === 'bank'}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Account Number *</label>
                <input
                  type="text"
                  value={formData.bank_details.account_number}
                  onChange={(e) => setFormData({
                    ...formData,
                    bank_details: { ...formData.bank_details, account_number: e.target.value }
                  })}
                  required={formData.pay_mode === 'bank'}
                  className="form-input"
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="form-section">
        <h3 className="section-title">Authorization</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Date of Payment</label>
            <input
              type="date"
              value={formData.date_of_payment}
              onChange={(e) => setFormData({ ...formData, date_of_payment: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Prepared By</label>
            <input
              type="text"
              value={formData.prepared_by}
              onChange={(e) => setFormData({ ...formData, prepared_by: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Approved By</label>
            <input
              type="text"
              value={formData.approved_by}
              onChange={(e) => setFormData({ ...formData, approved_by: e.target.value })}
              className="form-input"
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary btn-large">
          Submit Voucher
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary btn-large" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default VoucherForm;
