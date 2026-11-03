"use client";

import { useState, useEffect } from 'react';

export default function EditEmployeeModal({ employee, onClose, onSave }) {
  const [formData, setFormData] = useState({ ...employee });

  useEffect(() => {
    setFormData({ ...employee }); // যখন নতুন এমপ্লয়ী সিলেক্ট হবে, ফর্ম ডেটা আপডেট হবে
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!employee) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Edit Employee: {employee.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* এখানে এমপ্লয়ী এডিট করার ফর্ম থাকবে */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
          </div>
          <div>
            <label htmlFor="designation" className="block text-sm font-medium">Designation</label>
            <input type="text" name="designation" value={formData.designation} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
          </div>
          <div>
            <label htmlFor="hourlyRate" className="block text-sm font-medium">Overtime Hourly Rate</label>
            <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
          </div>
          {/* ... অন্যান্য ফিল্ডও যোগ করতে পারেন ... */}
          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[#11b1e6] text-white rounded-lg">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}