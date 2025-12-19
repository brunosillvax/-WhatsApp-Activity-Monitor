import React, { useEffect, useState } from 'react';
import {Eye, EyeOff, Plus, Trash2, Zap, MessageCircle, Settings} from 'lucide-react';
import { socket as appSocket, Platform, ConnectionState } from '../App';
import { ContactCard } from './ContactCard';
import { Login } from './Login';

type ProbeMethod = 'delete' | 'reaction';

interface DashboardProps {
    connectionState: ConnectionState;
}

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

interface ContactInfo {
    jid: string;
    displayNumber: string;
    contactName: string;
    data: TrackerData[];
    devices: DeviceInfo[];
    deviceCount: number;
    presence: string | null;
    profilePic: string | null;
    platform: Platform;
    presenceHistory?: Array<{ presence: string; timestamp: number; jid: string }>;
    typingStatus?: { isTyping: boolean; timestamp: number } | null;
    lastSeen?: { timestamp: number; jid: string } | null;
    connectionInfo?: Array<{ jid: string; lastActive: number; connectionType?: string }>;
}

export function Dashboard({ connectionState }: DashboardProps) {
    const [inputNumber, setInputNumber] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState<Platform>(
        connectionState.whatsapp ? 'whatsapp' : 'signal'
    );
    const [contacts, setContacts] = useState<Map<string, ContactInfo>>(new Map());
    const [error, setError] = useState<string | null>(null);
    const [privacyMode, setPrivacyMode] = useState(false);
    const [probeMethod, setProbeMethod] = useState<ProbeMethod>('delete');
    const [showConnections, setShowConnections] = useState(false);
    const [alerts, setAlerts] = useState<Array<{ id: number; message: string; type: string; timestamp: number }>>([]);

    useEffect(() => {
        function onTrackerUpdate(update: any) {
            const { jid, ...data } = update;
            if (!jid) return;

            setContacts(prev => {
                const next = new Map(prev);
                const contact = next.get(jid);

                if (contact) {
                    // Update existing contact
                    const updatedContact = { ...contact };

                    if (data.presence !== undefined) {
                        updatedContact.presence = data.presence;
                    }
                    if (data.deviceCount !== undefined) {
                        updatedContact.deviceCount = data.deviceCount;
                    }
                    if (data.devices !== undefined) {
                        updatedContact.devices = data.devices;
                    }

                    // Add to chart data
                    if (data.median !== undefined && data.devices && data.devices.length > 0) {
                        const newDataPoint: TrackerData = {
                            rtt: data.devices[0].rtt,
                            avg: data.devices[0].avg,
                            median: data.median,
                            threshold: data.threshold,
                            state: data.devices.find((d: DeviceInfo) => d.state.includes('Online'))?.state || data.devices[0].state,
                            timestamp: Date.now(),
                        };
                        updatedContact.data = [...updatedContact.data, newDataPoint];
                    }

                    // Store enhanced capture data if available
                    if (data.presenceHistory !== undefined) {
                        updatedContact.presenceHistory = data.presenceHistory;
                    }
                    if (data.typingStatus !== undefined) {
                        updatedContact.typingStatus = data.typingStatus;
                    }
                    if (data.lastSeen !== undefined) {
                        updatedContact.lastSeen = data.lastSeen;
                    }
                    if (data.connectionInfo !== undefined) {
                        updatedContact.connectionInfo = data.connectionInfo;
                    }

                    next.set(jid, updatedContact);
                }

                return next;
            });
        }

        function onProfilePic(data: { jid: string, url: string | null }) {
            setContacts(prev => {
                const next = new Map(prev);
                const contact = next.get(data.jid);
                if (contact) {
                    next.set(data.jid, { ...contact, profilePic: data.url });
                }
                return next;
            });
        }

        function onContactName(data: { jid: string, name: string }) {
            setContacts(prev => {
                const next = new Map(prev);
                const contact = next.get(data.jid);
                if (contact) {
                    next.set(data.jid, { ...contact, contactName: data.name });
                }
                return next;
            });
        }

        function onContactAdded(data: { jid: string, number: string, platform?: Platform }) {
            setContacts(prev => {
                const next = new Map(prev);
                next.set(data.jid, {
                    jid: data.jid,
                    displayNumber: data.number,
                    contactName: data.number,
                    data: [],
                    devices: [],
                    deviceCount: 0,
                    presence: null,
                    profilePic: null,
                    platform: data.platform || 'whatsapp'
                });
                return next;
            });
            setInputNumber('');
        }

        function onContactRemoved(jid: string) {
            setContacts(prev => {
                const next = new Map(prev);
                next.delete(jid);
                return next;
            });
        }

        function onError(data: { jid?: string, message: string }) {
            setError(data.message);
            setTimeout(() => setError(null), 3000);
        }

        function onProbeMethod(method: ProbeMethod) {
            setProbeMethod(method);
        }

        function onAlert(alert: { jid: string; type: string; message: string; timestamp: number }) {
            setAlerts(prev => {
                const newAlert = { id: Date.now(), ...alert };
                const updated = [newAlert, ...prev].slice(0, 10); // Keep last 10 alerts
                return updated;
            });
            
            // Show browser notification if permitted
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Device Activity Tracker', {
                    body: alert.message,
                    icon: '/favicon.ico'
                });
            }
        }

        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        function onTrackedContacts(contacts: { id: string, platform: Platform }[]) {
            setContacts(prev => {
                const next = new Map(prev);
                contacts.forEach(({ id, platform }) => {
                    if (!next.has(id)) {
                        // Extract display number from id
                        let displayNumber = id;
                        if (platform === 'signal') {
                            displayNumber = id.replace('signal:', '');
                        } else {
                            // WhatsApp JID format: number@s.whatsapp.net
                            displayNumber = id.split('@')[0];
                        }
                        next.set(id, {
                            jid: id,
                            displayNumber,
                            contactName: displayNumber,
                            data: [],
                            devices: [],
                            deviceCount: 0,
                            presence: null,
                            profilePic: null,
                            platform
                        });
                    }
                });
                return next;
            });
        }

        appSocket.on('tracker-update', onTrackerUpdate);
        appSocket.on('profile-pic', onProfilePic);
        appSocket.on('contact-name', onContactName);
        appSocket.on('contact-added', onContactAdded);
        appSocket.on('contact-removed', onContactRemoved);
        appSocket.on('error', onError);
        appSocket.on('probe-method', onProbeMethod);
        appSocket.on('tracked-contacts', onTrackedContacts);
        appSocket.on('alert', onAlert);

        // Request tracked contacts after listeners are set up
        appSocket.emit('get-tracked-contacts');

        return () => {
            appSocket.off('tracker-update', onTrackerUpdate);
            appSocket.off('profile-pic', onProfilePic);
            appSocket.off('contact-name', onContactName);
            appSocket.off('contact-added', onContactAdded);
            appSocket.off('contact-removed', onContactRemoved);
            appSocket.off('error', onError);
            appSocket.off('probe-method', onProbeMethod);
            appSocket.off('tracked-contacts', onTrackedContacts);
            appSocket.off('alert', onAlert);
        };
    }, []);

    const handleAdd = () => {
        if (!inputNumber) return;
        appSocket.emit('add-contact', { number: inputNumber, platform: selectedPlatform });
    };

    const handleRemove = (jid: string) => {
        appSocket.emit('remove-contact', jid);
    };

    const handleProbeMethodChange = (method: ProbeMethod) => {
        appSocket.emit('set-probe-method', method);
    };

    return (
        <div className="space-y-6">
            {/* Add Contact Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-semibold text-gray-900">Track Contacts</h2>
                        {/* Manage Connections button */}
                        <button
                            onClick={() => setShowConnections(!showConnections)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
                                showConnections
                                    ? 'bg-gray-700 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <Settings size={14} />
                            {showConnections ? 'Hide Connections' : 'Manage Connections'}
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Probe Method Toggle */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Probe Method:</span>
                            <div className="flex rounded-lg overflow-hidden border border-gray-300">
                                <button
                                    onClick={() => handleProbeMethodChange('delete')}
                                    className={`px-3 py-1.5 text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                                        probeMethod === 'delete'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                    title="Silent Delete Probe - Completely covert, target sees nothing"
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                                <button
                                    onClick={() => handleProbeMethodChange('reaction')}
                                    className={`px-3 py-1.5 text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                                        probeMethod === 'reaction'
                                            ? 'bg-yellow-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                    title="Reaction Probe - Sends reactions to non-existent messages"
                                >
                                    <Zap size={14} />
                                    Reaction
                                </button>
                            </div>
                        </div>
                        {/* Privacy Mode Toggle */}
                        <button
                            onClick={() => setPrivacyMode(!privacyMode)}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all duration-200 ${
                                privacyMode 
                                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-md' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            title={privacyMode ? 'Privacy Mode: ON (Click to disable)' : 'Privacy Mode: OFF (Click to enable)'}
                        >
                            {privacyMode ? (
                                <>
                                    <EyeOff size={20} />
                                    <span>Privacy ON</span>
                                </>
                            ) : (
                                <>
                                    <Eye size={20} />
                                    <span>Privacy OFF</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
                <div className="flex gap-4">
                    {/* Platform Selector */}
                    <div className="flex rounded-lg overflow-hidden border border-gray-300">
                        <button
                            onClick={() => setSelectedPlatform('whatsapp')}
                            disabled={!connectionState.whatsapp}
                            className={`px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                selectedPlatform === 'whatsapp'
                                    ? 'bg-green-600 text-white'
                                    : connectionState.whatsapp
                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                            title={connectionState.whatsapp ? 'WhatsApp' : 'WhatsApp not connected'}
                        >
                            <MessageCircle size={16} />
                            WhatsApp
                        </button>
                        <button
                            onClick={() => setSelectedPlatform('signal')}
                            disabled={!connectionState.signal}
                            className={`px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                selectedPlatform === 'signal'
                                    ? 'bg-blue-600 text-white'
                                    : connectionState.signal
                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                            title={connectionState.signal ? 'Signal' : 'Signal not connected'}
                        >
                            <MessageCircle size={16} />
                            Signal
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="Enter phone number (e.g. 491701234567)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={inputNumber}
                        onChange={(e) => setInputNumber(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <button
                        onClick={handleAdd}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors"
                    >
                        <Plus size={20} /> Add Contact
                    </button>
                </div>
                {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
            </div>

            {/* Alerts Panel */}
            {alerts.length > 0 && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Alertas Recentes</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {alerts.map(alert => (
                            <div
                                key={alert.id}
                                className={`p-3 rounded-lg text-sm ${
                                    alert.type === 'state-change' ? 'bg-blue-50 border border-blue-200' :
                                    alert.type === 'network-change' ? 'bg-yellow-50 border border-yellow-200' :
                                    'bg-gray-50 border border-gray-200'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-700">{alert.message}</span>
                                    <button
                                        onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                                        className="text-gray-400 hover:text-gray-600 ml-2"
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {new Date(alert.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => setAlerts([])}
                        className="mt-3 text-sm text-gray-600 hover:text-gray-800"
                    >
                        Limpar todos
                    </button>
                </div>
            )}

            {/* Connections Panel */}
            {showConnections && (
                <Login connectionState={connectionState} />
            )}

            {/* Contact Cards */}
            {contacts.size === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                    <p className="text-gray-500 text-lg">No contacts being tracked</p>
                    <p className="text-gray-400 text-sm mt-2">Add a contact above to start tracking</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Array.from(contacts.values()).map(contact => (
                        <ContactCard
                            key={contact.jid}
                            jid={contact.jid}
                            displayNumber={contact.contactName}
                            data={contact.data}
                            devices={contact.devices}
                            deviceCount={contact.deviceCount}
                            presence={contact.presence}
                            profilePic={contact.profilePic}
                            onRemove={() => handleRemove(contact.jid)}
                            privacyMode={privacyMode}
                            platform={contact.platform}
                            socket={appSocket}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
