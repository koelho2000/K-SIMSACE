import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PointList from './components/PointList';
import EmptyState from './components/EmptyState';
import AddEquipmentModal from './components/AddEquipmentModal';
import { Equipment } from './types';

const App: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('gtc_equipment_list');
    if (saved) {
      try {
        setEquipmentList(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('gtc_equipment_list', JSON.stringify(equipmentList));
  }, [equipmentList]);

  const handleAddEquipment = (newEquipment: Equipment) => {
    setEquipmentList(prev => [...prev, newEquipment]);
    setSelectedEquipmentId(newEquipment.id);
    setIsModalOpen(false);
  };

  const handleDeleteEquipment = (id: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar este equipamento e todos os seus pontos?')) {
      setEquipmentList(prev => prev.filter(e => e.id !== id));
      if (selectedEquipmentId === id) {
        setSelectedEquipmentId(null);
      }
    }
  };

  const handleUpdateEquipment = (updatedEquipment: Equipment) => {
    setEquipmentList(prev => prev.map(e => e.id === updatedEquipment.id ? updatedEquipment : e));
  };

  const selectedEquipment = equipmentList.find(e => e.id === selectedEquipmentId);

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900 font-sans overflow-hidden">
      <Sidebar 
        equipmentList={equipmentList}
        selectedEquipmentId={selectedEquipmentId}
        onSelectEquipment={setSelectedEquipmentId}
        onAddEquipment={() => setIsModalOpen(true)}
        onDeleteEquipment={handleDeleteEquipment}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {selectedEquipment ? (
          <PointList 
            equipment={selectedEquipment} 
            onUpdateEquipment={handleUpdateEquipment}
          />
        ) : (
          <EmptyState 
            onAddFirst={() => setIsModalOpen(true)}
            hasItems={equipmentList.length > 0}
          />
        )}
      </main>

      <AddEquipmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddEquipment}
      />
    </div>
  );
};

export default App;