import React, { useEffect, useState } from 'react';
import { useDirectoryStore } from '../../store/directoryStore';
import { Save, Plus, Trash2, DollarSign, Filter } from 'lucide-react';
import { nanoid } from 'nanoid';

const ProfileBuilder: React.FC = () => {
  const {
    sections,
    loadSectionsFromDB,
    addSection,
    removeSection,
    updateField
  } = useDirectoryStore();

  const [newSection, setNewSection] = useState({ name: '', description: '' });
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadSectionsFromDB();
  }, []);

  const handleAddSection = () => {
    if (newSection.name && newSection.description) {
      addSection({
        id: nanoid(),
        name: newSection.name,
        description: newSection.description,
        fields: [],
        required: false,
        order: sections.length + 1
      });
      setNewSection({ name: '', description: '' });
    }
  };

  const handlePublishProfile = () => {
    setShowPaymentModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-[#004D4D]">Profile Builder</h2>
          <p className="text-sm text-gray-500">Configure profile sections and payment requirements</p>
        </div>
        <button
          onClick={handlePublishProfile}
          className="flex items-center gap-2 px-4 py-2 bg-[#004D4D] text-white rounded-lg hover:bg-[#003939]"
        >
          <DollarSign size={20} />
          Configure Payment
        </button>
      </div>

      {/* Add New Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium mb-4">Add New Section</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
            <input
              type="text"
              value={newSection.name}
              onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#004D4D]"
              placeholder="e.g., Professional Info"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={newSection.description}
              onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#004D4D]"
              placeholder="Brief section description"
            />
          </div>
        </div>
        <button
          onClick={handleAddSection}
          className="flex items-center gap-2 px-4 py-2 bg-[#004D4D] text-white rounded-lg hover:bg-[#003939]"
        >
          <Plus size={20} />
          Add Section
        </button>
      </div>

      {/* Existing Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium">{section.name}</h3>
                <p className="text-sm text-gray-500">{section.description}</p>
              </div>
              <button
                onClick={() => removeSection(section.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{field.name}</h4>
                    <p className="text-sm text-gray-500">{field.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {field.required && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        Required
                      </span>
                    )}
                    <label className="flex items-center gap-1 text-xs text-gray-600">
                      <Filter size={14} />
                      <input
                        type="checkbox"
                        checked={!!field.filter}
                        onChange={(e) =>
                          updateField(section.id, field.id, { filter: e.target.checked })
                        }
                      />
                      Filter
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Payment Settings */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Configure Payment Requirements</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Activation Fee
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#004D4D]"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subscription Period
                </label>
                <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#004D4D]">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 bg-[#004D4D] text-white rounded-lg hover:bg-[#003939]"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileBuilder;
