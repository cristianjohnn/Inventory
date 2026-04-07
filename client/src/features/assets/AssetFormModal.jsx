import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { assetsApi } from '../../api/client.js';
import { CATEGORY_OPTIONS, DEPRECIATION_METHODS, STATUS_OPTIONS } from '../../utils/constants.js';
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
        location: asset.location || '',
        warrantyExpiry: asset.warrantyExpiry ? asset.warrantyExpiry.split('T')[0] : '',
        notes: asset.notes || '',
      });
    } else if (isOpen && !asset) {
      // Reset form
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
      // Clean up data before sending
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-300 mb-1">Asset Name *</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200" placeholder="e.g. MacBook Pro 16" />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200">
              {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Serial Number *</label>
            <input required type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Purchase Date *</label>
            <input required type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Purchase Price ($) *</label>
            <input required type="number" min="0" step="0.01" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Useful Life (Years) *</label>
            <input required type="number" min="1" step="1" name="usefulLifeYears" value={formData.usefulLifeYears} onChange={handleChange} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Salvage Value ($) *</label>
            <input required type="number" min="0" step="0.01" name="salvageValue" value={formData.salvageValue} onChange={handleChange} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Depreciation Method *</label>
            <select name="depreciationMethod" value={formData.depreciationMethod} onChange={handleChange} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200">
              {DEPRECIATION_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          {formData.depreciationMethod === 'UNITS_OF_PRODUCTION' && (
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Total Units Lifecycle *</label>
                <input required type="number" min="1" name="totalUnits" value={formData.totalUnits} onChange={handleChange} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Units Used</label>
                <input type="number" min="0" name="unitsUsed" value={formData.unitsUsed} onChange={handleChange} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200" />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200">
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Warranty Expiry</label>
            <input type="date" name="warrantyExpiry" value={formData.warrantyExpiry} onChange={handleChange} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-300 mb-1">Notes</label>
            <textarea name="notes" rows="3" value={formData.notes} onChange={handleChange} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 resize-none" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/50">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/20">
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Asset'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
