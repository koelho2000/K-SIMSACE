import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, User, Building, Save } from 'lucide-react';
import { ProjectInfo } from '../types';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  info: ProjectInfo;
  onSave: (info: ProjectInfo) => void;
}

const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({ isOpen, onClose, info, onSave }) => {
  const [formData, setFormData] = useState<ProjectInfo>(info);

  useEffect(() => {
    setFormData(info);
  }, [info, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Dados do Projeto
                  </h3>
                  <p className="text-sm text-gray-500">
                    Estas informações serão apresentadas no relatório técnico.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">Nome do Projeto</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="projectName"
                      id="projectName"
                      required
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md border py-2"
                      value={formData.projectName}
                      onChange={handleChange}
                      placeholder="Ex: Edifício Administrativo Lisboa"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">Localização</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md border py-2"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Ex: Lisboa, Portugal"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Cliente & Técnico</h4>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">Nome do Cliente</label>
                      <input
                        type="text"
                        name="clientName"
                        id="clientName"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md border py-2 px-3"
                        value={formData.clientName}
                        onChange={handleChange}
                        placeholder="Empresa Cliente, Lda."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="technicianName" className="block text-sm font-medium text-gray-700">Técnico Responsável</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              name="technicianName"
                              id="technicianName"
                              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md border py-2"
                              value={formData.technicianName}
                              onChange={handleChange}
                              placeholder="Seu Nome"
                            />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="technicianCompany" className="block text-sm font-medium text-gray-700">Sua Empresa</label>
                        <input
                          type="text"
                          name="technicianCompany"
                          id="technicianCompany"
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md border py-2 px-3"
                          value={formData.technicianCompany}
                          onChange={handleChange}
                          placeholder="K-SIMSACE Inc."
                        />
                      </div>
                    </div>
                  </div>
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

export default ProjectSettingsModal;