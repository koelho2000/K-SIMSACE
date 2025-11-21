
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PointList from './components/PointList';
import EmptyState from './components/EmptyState';
import AddEquipmentModal from './components/AddEquipmentModal';
import EditEquipmentModal from './components/EditEquipmentModal';
import SummaryModal from './components/SummaryModal';
import ReportPreview from './components/ReportPreview';
import BudgetModal from './components/BudgetModal';
import ProjectSettingsModal from './components/ProjectSettingsModal';
import EN15232Report from './components/EN15232Report';
import LandingPage from './components/LandingPage';
import { Equipment, ProjectInfo } from './types';

const DEFAULT_PROJECT_INFO: ProjectInfo = {
  projectName: 'Novo Projeto GTC',
  location: '',
  clientName: '',
  technicianName: '',
  technicianCompany: 'K-SIMSACE'
};

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(DEFAULT_PROJECT_INFO);
  
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEN15232Open, setIsEN15232Open] = useState(false);

  // Equipment being edited
  const [equipmentToEdit, setEquipmentToEdit] = useState<Equipment | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const savedEq = localStorage.getItem('gtc_equipment_list');
    const savedInfo = localStorage.getItem('gtc_project_info');
    
    if (savedEq) {
      try {
        const parsed = JSON.parse(savedEq);
        const hydrated = parsed.map((e: any) => ({
          ...e,
          quantity: e.quantity || 1
        }));
        setEquipmentList(hydrated);
      } catch (e) {
        console.error("Failed to load equipment data", e);
      }
    }

    if (savedInfo) {
      try {
        setProjectInfo(JSON.parse(savedInfo));
      } catch (e) {
        console.error("Failed to load project info", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('gtc_equipment_list', JSON.stringify(equipmentList));
  }, [equipmentList]);

  useEffect(() => {
    localStorage.setItem('gtc_project_info', JSON.stringify(projectInfo));
  }, [projectInfo]);

  const handleAddEquipment = (newEquipment: Equipment) => {
    setEquipmentList(prev => [...prev, newEquipment]);
    setSelectedEquipmentId(newEquipment.id);
    setIsAddModalOpen(false);
  };

  const handleDeleteEquipment = (id: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar este equipamento e todos os seus pontos?')) {
      setEquipmentList(prev => prev.filter(e => e.id !== id));
      if (selectedEquipmentId === id) {
        setSelectedEquipmentId(null);
      }
    }
  };

  const handleDuplicateEquipment = (id: string) => {
    const eqToClone = equipmentList.find(e => e.id === id);
    if (!eqToClone) return;

    const clonedEquipment: Equipment = {
      ...eqToClone,
      id: crypto.randomUUID(),
      name: `${eqToClone.name} (Cópia)`,
      points: eqToClone.points.map(p => ({
        ...p,
        id: crypto.randomUUID()
      }))
    };

    setEquipmentList(prev => [...prev, clonedEquipment]);
  };

  const handleUpdateEquipment = (updatedEquipment: Equipment) => {
    setEquipmentList(prev => prev.map(e => e.id === updatedEquipment.id ? updatedEquipment : e));
  };

  const openEditModal = (id: string) => {
    const eq = equipmentList.find(e => e.id === id);
    if (eq) {
      setEquipmentToEdit(eq);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEquipmentChanges = (id: string, updates: Partial<Equipment>) => {
    setEquipmentList(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const handleNewProject = () => {
    if (window.confirm('ATENÇÃO: Esta ação irá apagar todos os equipamentos e dados do projeto atual. Deseja começar um novo projeto do zero?')) {
      // Reset State
      setEquipmentList([]);
      setProjectInfo(DEFAULT_PROJECT_INFO);
      setSelectedEquipmentId(null);
      
      // Close other modals
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setIsSummaryOpen(false);
      setIsReportOpen(false);
      setIsBudgetOpen(false);
      setIsEN15232Open(false);

      // Open Settings Modal to let user input new project details
      setIsSettingsOpen(true);
    }
  };

  const handleExportProject = () => {
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      projectInfo,
      equipmentList
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `K-SIMSACE_${projectInfo.projectName.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportProject = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.equipmentList && Array.isArray(data.equipmentList)) {
          if (window.confirm('Ao importar um projeto, os dados atuais serão substituídos. Deseja continuar?')) {
            setEquipmentList(data.equipmentList);
            if (data.projectInfo) {
              setProjectInfo(data.projectInfo);
            }
            setSelectedEquipmentId(null);
            alert('Projeto importado com sucesso!');
          }
        } else {
          alert('Ficheiro inválido ou corrompido.');
        }
      } catch (error) {
        console.error("Import error", error);
        alert('Erro ao ler o ficheiro.');
      }
    };
    reader.readAsText(file);
  };

  const selectedEquipment = equipmentList.find(e => e.id === selectedEquipmentId);

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900 font-sans overflow-hidden">
      <Sidebar 
        equipmentList={equipmentList}
        selectedEquipmentId={selectedEquipmentId}
        onSelectEquipment={setSelectedEquipmentId}
        onAddEquipment={() => setIsAddModalOpen(true)}
        onDeleteEquipment={handleDeleteEquipment}
        onDuplicateEquipment={handleDuplicateEquipment}
        onEditEquipment={openEditModal}
        onOpenSummary={() => setIsSummaryOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenBudget={() => setIsBudgetOpen(true)}
        onOpenEN15232={() => setIsEN15232Open(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExport={handleExportProject}
        onImport={handleImportProject}
        onNewProject={handleNewProject}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {selectedEquipment ? (
          <PointList 
            equipment={selectedEquipment} 
            onUpdateEquipment={handleUpdateEquipment}
            onEditEquipment={() => openEditModal(selectedEquipment.id)}
          />
        ) : (
          <EmptyState 
            onAddFirst={() => setIsAddModalOpen(true)}
            hasItems={equipmentList.length > 0}
          />
        )}
      </main>

      <AddEquipmentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddEquipment}
      />

      <EditEquipmentModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        equipment={equipmentToEdit}
        onSave={handleSaveEquipmentChanges}
      />

      <SummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        equipmentList={equipmentList}
      />

      {isReportOpen && (
        <ReportPreview 
          equipmentList={equipmentList}
          projectInfo={projectInfo}
          onClose={() => setIsReportOpen(false)}
        />
      )}

      <BudgetModal
        isOpen={isBudgetOpen}
        onClose={() => setIsBudgetOpen(false)}
        equipmentList={equipmentList}
      />

      <EN15232Report 
        isOpen={isEN15232Open}
        onClose={() => setIsEN15232Open(false)}
        equipmentList={equipmentList}
        projectName={projectInfo.projectName}
        projectInfo={projectInfo}
      />

      <ProjectSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        info={projectInfo}
        onSave={setProjectInfo}
      />
    </div>
  );
};

export default App;
