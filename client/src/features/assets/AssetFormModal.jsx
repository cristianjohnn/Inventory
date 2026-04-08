import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { assetsApi } from '../../api/client.js';
import { CATEGORY_OPTIONS, DEPRECIATION_METHODS, STATUS_OPTIONS, DEPARTMENT_OPTIONS } from '../../utils/constants.js';
import Modal from '../../components/ui/Modal.jsx';

export default function AssetFormModal({ isOpen, onClose, asset = null, onSuccess }) {
  const isEdit = !!asset;

  const [formData, setFormData] = useState({
    name: '',
    category: 'LAPTOP',
    serialNumber: '',
    purchaseDate: '',
    purchasePrice: '',
    salvageValue: '',
    usefulLifeYears: '',
    depreciationMethod: 'STRAIGHT_LINE',
    totalUnits: '',
    unitsUsed: '',
    status: 'AVAILABLE',
    department: '',
    location: '',
    warrantyExpiry: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && asset) {
      setFormData({
        name: asset.name,
        category: asset.category,
        serialNumber: asset.serialNumber,
        purchaseDate: asset.purchaseDate.split('T')[0],
        purchasePrice: asset.purchasePrice,
        salvageValue: asset.salvageValue,
        usefulLifeYears: asset.usefulLifeYears,
        depreciationMethod: asset.depreciationMethod,
        totalUnits: asset.totalUnits || '',
        unitsUsed: asset.unitsUsed || '',
        status: asset.status,
        department: asset.department || '',
        location: asset.location || '',
        warrantyExpiry: asset.warrantyExpiry ? asset.warrantyExpiry.split('T')[0] : '',
        notes: asset.notes || '',
      });
    } else if (isOpen && !asset) {
      setFormData({
        name: '',
        category: 'LAPTOP',
        serialNumber: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchasePrice: '',
        salvageValue: '',
        usefulLifeYears: '',
        depreciationMethod: 'STRAIGHT_LINE',
        totalUnits: '',
        unitsUsed: '',
        status: 'AVAILABLE',
        department: '',
        location: '',
        warrantyExpiry: '',
        notes: '',
      });
    }
  }, [isOpen, asset]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : '') : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData };

      if (payload.depreciationMethod !== 'UNITS_OF_PRODUCTION') {
        payload.totalUnits = null;
        payload.unitsUsed = null;
      }
      if (!payload.warrantyExpiry) payload.warrantyExpiry = null;

      if (isEdit) {
        await assetsApi.update(asset.id, payload);
        toast.success('Asset updated successfully');
      } else {
        await assetsApi.create(payload);
        toast.success('Asset created successfully');
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      if (err.details && Array.isArray(err.details)) {
        err.details.forEach(d => toast.error(`${d.field}: ${d.message}`));
      } else {
        toast.error(err.message || `Failed to ${isEdit ? 'update' : 'create'} asset`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Asset' : 'Add New Asset'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* General Info Section */}
        <div>
          <div className="form-section-title">General Information</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="form-label">Asset Name *</label>
              <input
                required type="text" name="name" value={formData.name} onChange={handleChange}
                className="form-input" placeholder="e.g. MacBook Pro 16"
              />
            </div>
            <div>
              <label className="form-label">Category *</label>
              <input
                type="text" list="categories" placeholder="Select or type..."
                name="category" value={formData.category} onChange={handleChange}
                required className="form-input"
              />
              <datalist id="categories">
                {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </datalist>
            </div>
            <div>
              <label className="form-label">Serial Number *</label>
              <input
                required type="text" name="serialNumber" value={formData.serialNumber}
                onChange={handleChange} className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="form-input">
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Department</label>
              <select name="department" value={formData.department} onChange={handleChange} className="form-input">
                <option value="">None / Unassigned</option>
                {DEPARTMENT_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Financial Section */}
        <div>
          <div className="form-section-title">Financial Data</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Purchase Date *</label>
              <input
                required type="date" name="purchaseDate" value={formData.purchaseDate}
                onChange={handleChange} className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Purchase Price (₱) *</label>
              <input
                type="number" step="0.01" name="purchasePrice" value={formData.purchasePrice}
                onChange={handleChange} required className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Salvage Value (₱) *</label>
              <input
                type="number" step="0.01" name="salvageValue" value={formData.salvageValue}
                onChange={handleChange} required className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Useful Life (Years) *</label>
              <input
                required type="number" min="1" step="1" name="usefulLifeYears"
                value={formData.usefulLifeYears} onChange={handleChange} className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Depreciation Section */}
        <div>
          <div className="form-section-title">Depreciation</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={formData.depreciationMethod !== 'UNITS_OF_PRODUCTION' ? 'md:col-span-2' : ''}>
              <label className="form-label">Depreciation Method *</label>
              <select
                name="depreciationMethod" value={formData.depreciationMethod}
                onChange={handleChange} className="form-input"
              >
                {DEPRECIATION_METHODS.map(m => (
                  <option key={m.value} value={m.value}>{m.label} — {m.description}</option>
                ))}
              </select>
            </div>
            {formData.depreciationMethod === 'UNITS_OF_PRODUCTION' && (
              <>
                <div>
                  <label className="form-label">Total Units Lifecycle *</label>
                  <input
                    required type="number" min="1" name="totalUnits" value={formData.totalUnits}
                    onChange={handleChange} className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Units Used</label>
                  <input
                    type="number" min="0" name="unitsUsed" value={formData.unitsUsed}
                    onChange={handleChange} className="form-input"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div>
          <div className="form-section-title">Additional Info</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Location</label>
              <input
                type="text" name="location" value={formData.location}
                onChange={handleChange} className="form-input" placeholder="e.g. Main Office, Room 201"
              />
            </div>
            <div>
              <label className="form-label">Warranty Expiry</label>
              <input
                type="date" name="warrantyExpiry" value={formData.warrantyExpiry}
                onChange={handleChange} className="form-input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Notes</label>
              <textarea
                name="notes" rows="3" value={formData.notes} onChange={handleChange}
                className="form-input resize-none"
                placeholder="Any additional notes about this asset..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Asset'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
