import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, Layers } from 'lucide-react';
import { Equipment } from '../types';

interface EditEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  onSave: (id: string, updates: Partial<Equipment>) => void;
}

const EditEquipmentModal: React.FC<EditEquipmentModalProps> = ({ isOpen, onClose, equipment, onSave }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (equipment) {
      setName(equipment.name);
      setQuantity(equipment.quantity || 1);
    }
  }, [equipment, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (equipment) {
      onSave(equipment.id, { name, quantity });
      onClose();
    }
  };

  if (!isOpen || !equipment) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="edit-modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                  <Edit2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="edit-modal-title">
                    Editar Equipamento
                  </h3>
                  <p className="text-sm text-gray-500">
                    Alterar detalhes de identificação e quantidades.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Nome do Equipamento (Tag)</label>
                  <input
                    type="text"
                    id="edit-name"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border py-2 px-3"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-quantity" className="block text-sm font-medium text-gray-700">Quantidade</label>
                  <div className="mt-1 relative rounded-md shadow-sm w-1/3">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Layers className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="edit-quantity"
                      min="1"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md border py-2"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">O número total de pontos será multiplicado por esta quantidade.</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Alterações
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEquipmentModal;