import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Square, Activity, Wifi, Smartphone, Monitor, MessageCircle, Download, BarChart3, Clock, Eye, Keyboard } from 'lucide-react';
import clsx from 'clsx';

type Platform = 'whatsapp' | 'signal';

interface TrackerData {
    rtt: number;
    avg: number;
    median: number;
    threshold: number;
    state: string;
    timestamp: number;
}

interface DeviceInfo {
    jid: string;
    state: string;
    rtt: number;
    avg: number;
}

interface ContactCardProps {
    jid: string;
    displayNumber: string;
    data: TrackerData[];
    devices: DeviceInfo[];
    deviceCount: number;
    presence: string | null;
    profilePic: string | null;
    onRemove: () => void;
    privacyMode?: boolean;
    platform?: Platform;
    socket?: any;
}

export function ContactCard({
    jid,
    displayNumber,
    data,
    devices,
    deviceCount,
    presence,
    profilePic,
    onRemove,
    privacyMode = false,
    platform = 'whatsapp',
    socket
}: ContactCardProps) {
    const [showStats, setShowStats] = useState(false);
    const [statistics, setStatistics] = useState<any>(null);
    const [showEnhanced, setShowEnhanced] = useState(false);
    const [enhancedData, setEnhancedData] = useState<any>(null);
    const lastData = data[data.length - 1];
    const currentStatus = devices.length > 0
        ? (devices.find(d => d.state === 'OFFLINE')?.state ||
            devices.find(d => d.state.includes('Online'))?.state ||
            devices[0].state)
        : 'Unknown';

    // Blur phone number in privacy mode
    const blurredNumber = privacyMode ? displayNumber.replace(/\d/g, '•') : displayNumber;

    useEffect(() => {
        if (!socket || !showStats) return;
        
        socket.emit('get-statistics', jid);
        const onStatistics = (response: any) => {
            if (response.jid === jid) {
                setStatistics(response.statistics);
            }
        };
        socket.on('statistics', onStatistics);
        
        return () => {
            if (socket) {
                socket.off('statistics', onStatistics);
            }
        };
    }, [socket, jid, showStats]);

    useEffect(() => {
        if (!socket || !showEnhanced) return;
        
        socket.emit('get-enhanced-capture', jid);
        const onEnhanced = (response: any) => {
            if (response.jid === jid) {
                setEnhancedData(response.data);
            }
        };
        socket.on('enhanced-capture-response', onEnhanced);
        
        // Refresh every 5 seconds
        const interval = setInterval(() => {
            socket.emit('get-enhanced-capture', jid);
        }, 5000);
        
        return () => {
            if (socket) {
                socket.off('enhanced-capture-response', onEnhanced);
            }
            clearInterval(interval);
        };
    }, [socket, jid, showEnhanced]);

    const handleExport = (format: 'json' | 'csv') => {
        if (format === 'csv') {
            window.open(`http://localhost:3001/api/export/${encodeURIComponent(jid)}/csv`, '_blank');
        } else {
            if (!socket) {
                alert('Socket não conectado. Por favor, aguarde a conexão.');
                return;
            }
            socket.emit('export-data', jid);
            const onExportResponse = (response: any) => {
                if (response.jid === jid) {
                    const dataStr = JSON.stringify(response.data, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `tracking_${jid}_${Date.now()}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                    socket.off('export-data-response', onExportResponse);
                }
            };
            socket.once('export-data-response', onExportResponse);
        }
    };

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header with Stop Button */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className={clsx(
                        "px-2 py-1 rounded text-xs font-medium flex items-center gap-1",
                        platform === 'whatsapp' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                    )}>
                        <MessageCircle size={12} />
                        {platform === 'whatsapp' ? 'WhatsApp' : 'Signal'}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">{blurredNumber}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowEnhanced(!showEnhanced)}
                        className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 font-medium transition-colors text-sm"
                        title="Enhanced Capture"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => setShowStats(!showStats)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors text-sm"
                        title="Show Statistics"
                    >
                        <BarChart3 size={16} />
                    </button>
                    <div className="relative group">
                        <button
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium transition-colors text-sm"
                            title="Export Data"
                        >
                            <Download size={16} />
                        </button>
                        <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[120px]">
                            <button
                                onClick={() => handleExport('json')}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Export JSON
                            </button>
                            <button
                                onClick={() => handleExport('csv')}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Export CSV
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={onRemove}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 font-medium transition-colors text-sm"
                    >
                        <Square size={16} /> Stop
                    </button>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Status Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md">
                                {profilePic ? (
                                    <img
                                        src={profilePic}
                                        alt="Profile"
                                        className={clsx(
                                            "w-full h-full object-cover transition-all duration-200",
                                            privacyMode && "blur-xl scale-110"
                                        )}
                                        style={privacyMode ? {
                                            filter: 'blur(16px) contrast(0.8)',
                                        } : {}}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <div className={clsx(
                                "absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white",
                                currentStatus === 'OFFLINE' ? "bg-red-500" :
                                    currentStatus.includes('Online') ? "bg-green-500" : "bg-gray-400"
                            )} />
                        </div>

                        <h4 className="text-xl font-bold text-gray-900 mb-1">{blurredNumber}</h4>

                        <div className="flex items-center gap-2 mb-4">
                            <span className={clsx(
                                "px-3 py-1 rounded-full text-sm font-medium",
                                currentStatus === 'OFFLINE' ? "bg-red-100 text-red-700" :
                                    currentStatus.includes('Online') ? "bg-green-100 text-green-700" :
                                        currentStatus === 'Standby' ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"
                            )}>
                                {currentStatus}
                            </span>
                        </div>

                        <div className="w-full pt-4 border-t border-gray-100 space-y-2">
                            <div className="flex justify-between items-center text-sm text-gray-600">
                                <span className="flex items-center gap-1"><Wifi size={16} /> Official Status</span>
                                <span className="font-medium">{presence || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-600">
                                <span className="flex items-center gap-1"><Smartphone size={16} /> Devices</span>
                                <span className="font-medium">{deviceCount || 0}</span>
                            </div>
                        </div>

                        {/* Device List */}
                        {devices.length > 0 && (
                            <div className="w-full pt-4 border-t border-gray-100 mt-4">
                                <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Device States</h5>
                                <div className="space-y-1">
                                    {devices.map((device, idx) => (
                                        <div key={device.jid} className="flex items-center justify-between text-sm py-1">
                                            <div className="flex items-center gap-2">
                                                <Monitor size={14} className="text-gray-400" />
                                                <span className="text-gray-600">Device {idx + 1}</span>
                                            </div>
                                            <span className={clsx(
                                                "px-2 py-0.5 rounded text-xs font-medium",
                                                device.state === 'OFFLINE' ? "bg-red-100 text-red-700" :
                                                    device.state.includes('Online') ? "bg-green-100 text-green-700" :
                                                        device.state === 'Standby' ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"
                                            )}>
                                                {device.state}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Metrics & Chart */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                <div className="text-sm text-gray-500 mb-1 flex items-center gap-1"><Activity size={16} /> Current Avg RTT</div>
                                <div className="text-2xl font-bold text-gray-900">{lastData?.avg.toFixed(0) || '-'} ms</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                <div className="text-sm text-gray-500 mb-1">Median (50)</div>
                                <div className="text-2xl font-bold text-gray-900">{lastData?.median.toFixed(0) || '-'} ms</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                <div className="text-sm text-gray-500 mb-1">Threshold</div>
                                <div className="text-2xl font-bold text-blue-600">{lastData?.threshold.toFixed(0) || '-'} ms</div>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200" style={{ minHeight: '300px', height: '300px' }}>
                            <h5 className="text-sm font-medium text-gray-500 mb-4">RTT History & Threshold</h5>
                            <div style={{ width: '100%', height: '250px', minHeight: '250px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="timestamp" hide />
                                        <YAxis domain={['auto', 'auto']} />
                                        <Tooltip
                                            labelFormatter={(t: number) => new Date(t).toLocaleTimeString()}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={2} dot={false} name="Avg RTT" isAnimationActive={false} />
                                        <Line type="step" dataKey="threshold" stroke="#ef4444" strokeDasharray="5 5" dot={false} name="Threshold" isAnimationActive={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Enhanced Capture Panel */}
                        {showEnhanced && enhancedData && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Eye size={20} />
                                    Captura Avançada
                                </h5>
                                <div className="space-y-4">
                                    {/* Current Presence */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-sm text-gray-600 mb-1">Status Atual</div>
                                        <div className="text-lg font-bold text-gray-900">{enhancedData.currentPresence || 'Desconhecido'}</div>
                                    </div>

                                    {/* Typing Status */}
                                    {enhancedData.typingStatus && (
                                        <div className="bg-yellow-50 p-4 rounded-lg flex items-center gap-2">
                                            <Keyboard size={20} className="text-yellow-600" />
                                            <div>
                                                <div className="text-sm text-gray-600">Status de Digitação</div>
                                                <div className="text-lg font-bold text-yellow-700">
                                                    {enhancedData.typingStatus.isTyping ? 'Digitando...' : 'Não está digitando'}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Last Seen */}
                                    {enhancedData.lastSeen && (
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <div className="text-sm text-gray-600 mb-1">Última Vez Online</div>
                                            <div className="text-lg font-bold text-blue-700">
                                                {new Date(enhancedData.lastSeen.timestamp).toLocaleString('pt-BR')}
                                            </div>
                                        </div>
                                    )}

                                    {/* Presence History */}
                                    {enhancedData.presenceHistory && enhancedData.presenceHistory.length > 0 && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="text-sm font-semibold text-gray-700 mb-2">Histórico de Presença (Últimas 10)</div>
                                            <div className="space-y-1 max-h-40 overflow-y-auto">
                                                {enhancedData.presenceHistory.slice(-10).reverse().map((entry: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span className="text-gray-600">{entry.presence}</span>
                                                        <span className="text-gray-400">
                                                            {new Date(entry.timestamp).toLocaleTimeString('pt-BR')}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tracked Devices */}
                                    {enhancedData.trackedDevices && enhancedData.trackedDevices.length > 0 && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="text-sm font-semibold text-gray-700 mb-2">Dispositivos Rastreados</div>
                                            <div className="space-y-1">
                                                {enhancedData.trackedDevices.map((deviceJid: string, idx: number) => (
                                                    <div key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                                                        <Monitor size={14} />
                                                        <span className="font-mono text-xs">{deviceJid}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Advanced Statistics Panel */}
                        {showStats && statistics && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <BarChart3 size={20} />
                                    Estatísticas Avançadas
                                </h5>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-xs text-gray-500 mb-1">Tempo Total Online</div>
                                        <div className="text-lg font-bold text-gray-900">
                                            {statistics.totalOnlineTime ? Math.floor(statistics.totalOnlineTime / 1000 / 60) : 0} min
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-xs text-gray-500 mb-1">Sessões</div>
                                        <div className="text-lg font-bold text-gray-900">{statistics.sessionCount || 0}</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-xs text-gray-500 mb-1">Duração Média</div>
                                        <div className="text-lg font-bold text-gray-900">
                                            {statistics.avgSessionDuration ? Math.floor(statistics.avgSessionDuration / 1000 / 60) : 0} min
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-xs text-gray-500 mb-1">Mudanças de Rede</div>
                                        <div className="text-lg font-bold text-gray-900">{statistics.networkChanges || 0}</div>
                                    </div>
                                </div>
                                {statistics.activeHours && statistics.activeHours.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="text-sm text-gray-600 mb-2">Horários Mais Ativos:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {statistics.activeHours.sort((a: number, b: number) => a - b).map((hour: number) => (
                                                <span key={hour} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                                    {hour}:00
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {statistics.lastNetworkType && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="text-sm text-gray-600 mb-2">Tipo de Rede Atual:</div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            statistics.lastNetworkType === 'wifi' ? 'bg-green-100 text-green-700' :
                                            statistics.lastNetworkType === 'mobile' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {statistics.lastNetworkType === 'wifi' ? 'WiFi' :
                                             statistics.lastNetworkType === 'mobile' ? 'Dados Móveis' : 'Desconhecido'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
