import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import AlertDialog from '../../components/AlertDialog';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useDialog } from '../../lib/useDialog';
import { restrictionsService, type RestriccionCampo } from '../../services/restrictions';

export default function RestriccionesCamposPage() {
    const { alertState, showAlert, closeAlert, confirmState, showConfirm, closeConfirm } = useDialog();
    
    // State
    const [restricciones, setRestricciones] = useState<RestriccionCampo[]>([]);
    const [tables, setTables] = useState<{name: string}[]>([]);
    const [columns, setColumns] = useState<{name: string, description?: string}[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Filters
    const [filterSearch, setFilterSearch] = useState('');
    const [filterTable, setFilterTable] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<RestriccionCampo>({
        tabla: '',
        columna: '',
        oculto: false,
        editable: true
    });

    useEffect(() => {
        fetchData();
        loadMetadata();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await restrictionsService.getRestricciones();
            setRestricciones(data);
        } catch (error) {
            console.error(error);
            showAlert('Error al cargar restricciones.', 'error', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const loadMetadata = async () => {
        try {
            const data = await restrictionsService.getMetadataTables();
            setTables(data);
        } catch (error) {
            console.error('Error metadata:', error);
        }
    };

    useEffect(() => {
        if (formData.tabla) {
            loadColumns(formData.tabla);
        } else {
            setColumns([]);
        }
    }, [formData.tabla]);

    const loadColumns = async (tableName: string) => {
        try {
            const data = await restrictionsService.getMetadataColumns(tableName);
            setColumns(data);
        } catch (error) {
            console.error(error);
        }
    };

    // Derived Logic
    const filteredData = restricciones.filter(r => {
        const matchSearch = r.tabla.toLowerCase().includes(filterSearch.toLowerCase()) ||
                          r.columna.toLowerCase().includes(filterSearch.toLowerCase());
        const matchTable = filterTable ? r.tabla === filterTable : true;
        return matchSearch && matchTable;
    });

    // CRUD
    const handleOpenModal = (r?: RestriccionCampo) => {
        if (r) {
            setFormData({
                id: r.id,
                tabla: r.tabla,
                columna: r.columna,
                oculto: r.oculto,
                editable: r.editable
            });
        } else {
            setFormData({
                tabla: '',
                columna: '',
                oculto: false,
                editable: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.tabla || !formData.columna) {
            showAlert('Debe seleccionar tabla y columna', 'warning', 'Atención');
            return;
        }

        if (submitting) return;
        setSubmitting(true);
        try {
            if (formData.id) {
                await restrictionsService.updateRestriccion(formData.id, formData);
                showAlert('Restricción actualizada con éxito.', 'success', 'Éxito');
            } else {
                await restrictionsService.createRestriccion(formData);
                showAlert('Restricción creada con éxito.', 'success', 'Éxito');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err: any) {
            console.error(err);
            const errMsg = err.response?.data?.detail || 'Error al guardar restricción.';
            showAlert(errMsg, 'error', 'Error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (r: RestriccionCampo) => {
        if (!r.id) return;
        showConfirm(`¿Eliminar la restricción para "${r.tabla}.${r.columna}"?`, async () => {
            try {
                await restrictionsService.deleteRestriccion(r.id!);
                fetchData();
                showAlert('Restricción eliminada.', 'success', 'Eliminado');
            } catch (err) {
                console.error(err);
                showAlert('No se pudo eliminar.', 'error', 'Error');
            }
        }, { title: 'Eliminar Restricción', variant: 'danger' });
    };

    return (
        <>
            <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
                <div className="flex-1 flex flex-col bg-background relative">
                    {/* Header */}
                    <div className="h-20 border-b border-border/50 flex items-center justify-between px-8 bg-background/50 backdrop-blur-sm sticky top-0 z-20">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Restricción de Campos</h1>
                            <p className="text-sm text-gray-500 mt-1">Control de visibilidad y edición por tabla</p>
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-500 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <i className="fa fa-plus"></i>
                            Nueva Restricción
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto p-8 relative">
                        {loading && <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center"><i className="fa fa-spinner fa-spin text-2xl text-indigo-500"></i></div>}
                        
                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-accent/5 p-4 rounded-lg border border-border mb-6 max-w-5xl mx-auto">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Buscar</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Tabla o columna..."
                                        className="w-full bg-card border border-border rounded px-3 py-2 pl-9 text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-colors"
                                        value={filterSearch}
                                        onChange={e => setFilterSearch(e.target.value)}
                                    />
                                    <i className="fa fa-search absolute left-3 top-2.5 text-gray-500 text-xs"></i>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Filtrar por Tabla</label>
                                <select
                                    className="w-full bg-card border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-colors"
                                    value={filterTable}
                                    onChange={e => setFilterTable(e.target.value)}
                                >
                                    <option value="">Todas las tablas</option>
                                    {tables.map(t => (
                                        <option key={t.name} value={t.name}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="max-w-5xl mx-auto">
                            <DataTable
                                data={filteredData}
                                keyField="id"
                                columns={[
                                    {
                                        key: 'tabla',
                                        label: 'Tabla',
                                        render: (val) => <span className="font-medium text-foreground">{val}</span>
                                    },
                                    {
                                        key: 'columna',
                                        label: 'Campo / Columna',
                                        render: (val, row) => (
                                            <div className="flex flex-col">
                                                <code className="text-xs text-indigo-400">{val}</code>
                                                {row.descripcion_columna && (
                                                    <span className="text-[10px] text-gray-500 italic mt-0.5">
                                                        {row.descripcion_columna}
                                                    </span>
                                                )}
                                            </div>
                                        )
                                    },
                                    {
                                        key: 'oculto',
                                        label: 'Visibilidad',
                                        render: (val) => (
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${val ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                {val ? 'OCULTO' : 'VISIBLE'}
                                            </span>
                                        )
                                    },
                                    {
                                        key: 'editable',
                                        label: 'Edición',
                                        render: (val) => (
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${val ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                {val ? 'EDITABLE' : 'SOLO LECTURA'}
                                            </span>
                                        )
                                    }
                                ]}
                                actions={(r) => (
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleOpenModal(r)}
                                            className="p-2 rounded-lg bg-accent/5 hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors"
                                            title="Editar"
                                        >
                                            <i className="fa fa-pencil"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(r)}
                                            className="p-2 rounded-lg bg-accent/5 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                            title="Eliminar"
                                        >
                                            <i className="fa fa-trash"></i>
                                        </button>
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={formData.id ? "Editar Restricción" : "Nueva Restricción"}
                >
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Tabla</label>
                                <select
                                    value={formData.tabla}
                                    onChange={e => setFormData({ ...formData, tabla: e.target.value, columna: '' })}
                                    className="w-full bg-card border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-indigo-500 transition-colors"
                                    required
                                >
                                    <option value="">Seleccione Tabla</option>
                                    {tables.map(t => (
                                        <option key={t.name} value={t.name}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Columna</label>
                                <select
                                    value={formData.columna}
                                    onChange={e => setFormData({ ...formData, columna: e.target.value })}
                                    className="w-full bg-card border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                                    disabled={!formData.tabla}
                                    required
                                >
                                    <option value="">Seleccione Columna</option>
                                    {columns.map(c => (
                                        <option key={c.name} value={c.name}>
                                            {c.name} {c.description ? `(${c.description})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="p-4 bg-accent/5 border border-border rounded-xl">
                                    <p className="text-sm font-medium text-foreground mb-2">Visibilidad</p>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            id="oculto"
                                            checked={formData.oculto}
                                            onChange={e => setFormData({...formData, oculto: e.target.checked})}
                                            className="w-4 h-4 rounded border-border text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="oculto" className="text-xs text-muted-foreground">¿Ocultar este campo?</label>
                                    </div>
                                </div>
                                <div className="p-4 bg-accent/5 border border-border rounded-xl">
                                    <p className="text-sm font-medium text-foreground mb-2">Edición</p>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            id="editable"
                                            checked={!formData.editable}
                                            onChange={e => setFormData({...formData, editable: !e.target.checked})}
                                            className="w-4 h-4 rounded border-border text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="editable" className="text-xs text-muted-foreground">¿Solo lectura?</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {submitting ? 'Guardando...' : formData.id ? 'Actualizar Restricción' : 'Guardar Restricción'}

                            </button>
                        </div>
                    </form>
                </Modal>

                <AlertDialog
                    isOpen={alertState.isOpen}
                    type={alertState.type}
                    title={alertState.title}
                    message={alertState.message}
                    onClose={closeAlert}
                />

                <ConfirmDialog
                    isOpen={confirmState.isOpen}
                    title={confirmState.title}
                    message={confirmState.message}
                    onConfirm={confirmState.onConfirm}
                    onClose={closeConfirm}
                />
            </div>
        </>
    );
}
