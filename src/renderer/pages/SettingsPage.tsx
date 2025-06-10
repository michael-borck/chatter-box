import { useState, useEffect } from 'react';
import { getAllPreferences, setPreference } from '../services/sqlite';
import { Save, ExternalLink, Download, Upload, RefreshCw, ChevronDown } from 'lucide-react';

// Component for API Key input with environment variable support
function ApiKeyInput({ 
  value, 
  onChange, 
  placeholder = "sk-... or leave empty",
  envPlaceholder = "env:API_KEY_NAME",
  fieldName 
}: { 
  value: string; 
  onChange: (value: string) => void;
  placeholder?: string;
  envPlaceholder?: string;
  fieldName: string;
}) {
  const isEnvVar = value?.startsWith('env:');
  
  return (
    <div className="space-y-2">
      <div className="flex gap-4">
        <label className="flex items-center">
          <input
            type="radio"
            name={`apiKeySource-${fieldName}`}
            value="manual"
            checked={!isEnvVar}
            onChange={() => onChange('')}
            className="mr-2"
          />
          <span className="text-sm">Manual Entry</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name={`apiKeySource-${fieldName}`}
            value="env"
            checked={isEnvVar}
            onChange={() => onChange(envPlaceholder)}
            className="mr-2"
          />
          <span className="text-sm">Environment Variable</span>
        </label>
      </div>
      
      <input
        type={isEnvVar ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder={isEnvVar ? envPlaceholder : placeholder}
      />
    </div>
  );
}

// Component for Model Selection with dropdown and custom entry
function ModelSelector({ 
  value, 
  onChange, 
  placeholder = "Select or enter model",
  models,
  loading,
  error,
  onRefresh,
  label,
  description
}: { 
  value: string; 
  onChange: (value: string) => void;
  placeholder?: string;
  models: string[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
  label: string;
  description?: string;
}) {
  const [isCustom, setIsCustom] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Check if current value is in the models list
  useEffect(() => {
    if (value && models.length > 0) {
      setIsCustom(!models.includes(value));
    }
  }, [value, models]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.model-selector-dropdown')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  const handleModelSelect = (selectedModel: string) => {
    if (selectedModel === '__custom__') {
      setIsCustom(true);
      setShowDropdown(false);
    } else {
      setIsCustom(false);
      onChange(selectedModel);
      setShowDropdown(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex gap-2">
        <div className="flex-1 relative model-selector-dropdown">
          {isCustom ? (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={placeholder}
            />
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white flex items-center justify-between"
              >
                <span className={value ? "text-gray-900" : "text-gray-500"}>
                  {value || placeholder}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              
              {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {models.length > 0 ? (
                    <>
                      {models.map((model) => (
                        <button
                          key={model}
                          type="button"
                          onClick={() => handleModelSelect(model)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                        >
                          {model}
                        </button>
                      ))}
                      <div className="border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => handleModelSelect('__custom__')}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none text-blue-600"
                        >
                          📝 Custom (manual entry)
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="px-4 py-2 text-gray-500">
                      {loading ? 'Loading models...' : 'No models available'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {isCustom && (
            <button
              type="button"
              onClick={() => {
                setIsCustom(false);
                if (models.length > 0) {
                  onChange(models[0]);
                }
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-600 hover:text-blue-700"
            >
              Back to list
            </button>
          )}
        </div>
        
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          title="Refresh models"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      
      {description && (
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

export function SettingsPage() {
  const [preferences, setPreferences] = useState({
    speachesUrl: 'https://speaches.serveur.au',
    sttUrl: 'https://speaches.serveur.au',
    ttsUrl: 'https://speaches.serveur.au',
    sttApiKey: '',
    ttsApiKey: '',
    ollamaUrl: 'https://ollama.serveur.au',
    ollamaApiKey: '',
    ollamaModel: 'llama2',
    voice: 'male' as 'male' | 'female',
    sttModel: 'Systran/faster-distil-whisper-small.en',
    ttsModel: 'speaches-ai/Kokoro-82M-v1.0-ONNX-int8',
    maleTTSModel: 'speaches-ai/piper-en_GB-alan-low',
    femaleTTSModel: 'speaches-ai/piper-en_US-amy-low',
    maleVoice: 'alan',
    femaleVoice: 'amy',
    ttsSpeed: '1.25'
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('stt');
  const [testing, setTesting] = useState({
    stt: false,
    tts: false,
    chat: false
  });
  const [testResults, setTestResults] = useState({
    stt: '',
    tts: '',
    chat: ''
  });
  const [models, setModels] = useState({
    stt: [],
    tts: [],
    chat: []
  });
  const [loadingModels, setLoadingModels] = useState({
    stt: false,
    tts: false,
    chat: false
  });
  const [modelErrors, setModelErrors] = useState({
    stt: '',
    tts: '',
    chat: ''
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await getAllPreferences();
      setPreferences({
        speachesUrl: prefs.speachesUrl || 'https://speaches.serveur.au',
        sttUrl: prefs.sttUrl || prefs.speachesUrl || 'https://speaches.serveur.au',
        ttsUrl: prefs.ttsUrl || prefs.speachesUrl || 'https://speaches.serveur.au',
        sttApiKey: prefs.sttApiKey || '',
        ttsApiKey: prefs.ttsApiKey || '',
        ollamaUrl: prefs.ollamaUrl || 'https://ollama.serveur.au',
        ollamaApiKey: prefs.ollamaApiKey || '',
        ollamaModel: prefs.ollamaModel || 'llama2',
        voice: (prefs.voice || 'male') as 'male' | 'female',
        sttModel: prefs.sttModel || 'Systran/faster-distil-whisper-small.en',
        ttsModel: prefs.ttsModel || 'speaches-ai/Kokoro-82M-v1.0-ONNX-int8',
        maleTTSModel: prefs.maleTTSModel || 'speaches-ai/piper-en_GB-alan-low',
        femaleTTSModel: prefs.femaleTTSModel || 'speaches-ai/piper-en_US-amy-low',
        maleVoice: prefs.maleVoice || 'alan',
        femaleVoice: prefs.femaleVoice || 'amy',
        ttsSpeed: prefs.ttsSpeed || '1.25'
      });
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    setMessage('');
    try {
      await setPreference('speachesUrl', preferences.speachesUrl);
      await setPreference('sttUrl', preferences.sttUrl);
      await setPreference('ttsUrl', preferences.ttsUrl);
      await setPreference('sttApiKey', preferences.sttApiKey);
      await setPreference('ttsApiKey', preferences.ttsApiKey);
      await setPreference('ollamaUrl', preferences.ollamaUrl);
      await setPreference('ollamaApiKey', preferences.ollamaApiKey);
      await setPreference('ollamaModel', preferences.ollamaModel);
      await setPreference('voice', preferences.voice);
      await setPreference('sttModel', preferences.sttModel);
      await setPreference('ttsModel', preferences.ttsModel);
      await setPreference('maleTTSModel', preferences.maleTTSModel);
      await setPreference('femaleTTSModel', preferences.femaleTTSModel);
      await setPreference('maleVoice', preferences.maleVoice);
      await setPreference('femaleVoice', preferences.femaleVoice);
      await setPreference('ttsSpeed', preferences.ttsSpeed);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setMessage('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const exportData = async () => {
    try {
      // This would be implemented in the sqlite service
      setMessage('Export feature coming soon!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const importData = async () => {
    try {
      // This would be implemented in the sqlite service
      setMessage('Import feature coming soon!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const testService = async (serviceType: 'stt' | 'tts' | 'chat') => {
    setTesting(prev => ({ ...prev, [serviceType]: true }));
    setTestResults(prev => ({ ...prev, [serviceType]: '' }));

    try {
      let baseUrl;
      
      switch (serviceType) {
        case 'stt':
          baseUrl = preferences.sttUrl;
          break;
        case 'tts':
          baseUrl = preferences.ttsUrl;
          break;
        case 'chat':
          baseUrl = preferences.ollamaUrl;
          break;
      }

      // Remove trailing slash for consistency
      const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

      // First, try a simple GET request to the base URL to check if server is reachable
      const baseResponse = await window.electronAPI.fetch({
        url: cleanUrl,
        options: {
          method: 'GET',
          headers: {}
        }
      });

      if (baseResponse.ok) {
        setTestResults(prev => ({ 
          ...prev, 
          [serviceType]: '✅ Server reachable and responding' 
        }));
        return;
      }

      // If base URL doesn't work, try common API endpoints
      const commonEndpoints = [
        '/health',
        '/status', 
        '/',
        '/docs',
        '/api',
        '/v1',
        '/v1/models',
        '/v1/audio/transcriptions', // OpenAI STT
        '/v1/audio/speech',         // OpenAI TTS
        '/v1/chat/completions',     // OpenAI Chat
        '/api/chat',                // Ollama-style
        '/api/generate',            // Ollama-style
        '/models',                  // Common model endpoint
      ];

      let foundEndpoint = false;
      let workingEndpoints = [];

      for (const endpoint of commonEndpoints) {
        try {
          const testResponse = await window.electronAPI.fetch({
            url: `${cleanUrl}${endpoint}`,
            options: {
              method: 'GET',
              headers: {}
            }
          });

          if (testResponse.ok || testResponse.status === 405 || testResponse.status === 401) {
            // 200 = working, 405 = method not allowed (endpoint exists), 401 = auth required
            workingEndpoints.push(endpoint);
            foundEndpoint = true;
          }
        } catch (e) {
          // Continue to next endpoint
        }
      }

      if (foundEndpoint) {
        setTestResults(prev => ({ 
          ...prev, 
          [serviceType]: `✅ Server reachable. Found endpoints: ${workingEndpoints.join(', ')}` 
        }));
      } else {
        // Try one more test with a HEAD request to see if server responds at all
        try {
          const headResponse = await window.electronAPI.fetch({
            url: cleanUrl,
            options: {
              method: 'HEAD',
              headers: {}
            }
          });

          if (headResponse.status < 500) {
            setTestResults(prev => ({ 
              ...prev, 
              [serviceType]: `⚠️ Server reachable but API endpoints not found. Status: ${headResponse.status}` 
            }));
          } else {
            setTestResults(prev => ({ 
              ...prev, 
              [serviceType]: `❌ Server error: ${headResponse.status} ${headResponse.statusText}` 
            }));
          }
        } catch (error) {
          setTestResults(prev => ({ 
            ...prev, 
            [serviceType]: `❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }));
        }
      }

    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [serviceType]: `❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }));
    } finally {
      setTesting(prev => ({ ...prev, [serviceType]: false }));
    }
  };

  const fetchModels = async (serviceType: 'stt' | 'tts' | 'chat') => {
    setLoadingModels(prev => ({ ...prev, [serviceType]: true }));
    setModelErrors(prev => ({ ...prev, [serviceType]: '' }));

    try {
      let url, endpoint;
      
      switch (serviceType) {
        case 'stt':
        case 'tts':
          url = serviceType === 'stt' ? preferences.sttUrl : preferences.ttsUrl;
          endpoint = url.endsWith('/') ? `${url}v1/models` : `${url}/v1/models`;
          break;
        case 'chat':
          url = preferences.ollamaUrl;
          endpoint = url.endsWith('/') ? `${url}api/tags` : `${url}/api/tags`;
          break;
      }

      const headers: any = {};
      const apiKey = serviceType === 'stt' ? preferences.sttApiKey : 
                    serviceType === 'tts' ? preferences.ttsApiKey : preferences.ollamaApiKey;
      
      if (apiKey && !apiKey.startsWith('env:')) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await window.electronAPI.fetch({
        url: endpoint,
        options: {
          method: 'GET',
          headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = JSON.parse(new TextDecoder().decode(response.data));
      
      let modelList = [];
      
      if (serviceType === 'chat') {
        // Ollama format: { "models": [{ "name": "model_name", ... }] }
        modelList = data.models?.map(model => model.name) || [];
      } else {
        // Speaches format: { "data": [{ "id": "model_id", ... }] }
        const allModels = data.data?.map(model => model.id) || [];
        
        if (serviceType === 'stt') {
          // Filter for whisper models only
          modelList = allModels.filter(model => model.toLowerCase().includes('whisper'));
        } else {
          // Filter out whisper models for TTS
          modelList = allModels.filter(model => !model.toLowerCase().includes('whisper'));
        }
      }

      setModels(prev => ({ ...prev, [serviceType]: modelList }));
      
    } catch (error) {
      setModelErrors(prev => ({ 
        ...prev, 
        [serviceType]: `Failed to fetch models: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }));
    } finally {
      setLoadingModels(prev => ({ ...prev, [serviceType]: false }));
    }
  };

  const tabs = [
    { id: 'stt', name: 'Speech-to-Text', icon: '🎤' },
    { id: 'tts', name: 'Text-to-Speech', icon: '🔊' },
    { id: 'chat', name: 'Chat Model', icon: '🤖' },
    { id: 'data', name: 'Data & Docs', icon: '📁' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('Failed') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
        }`}>
          {message}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="space-y-8">
        {/* Speech-to-Text Tab */}
        {activeTab === 'stt' && (
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Speech-to-Text (STT) Service</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  STT Server URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={preferences.sttUrl}
                    onChange={(e) => setPreferences({ ...preferences, sttUrl: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://speaches.serveur.au"
                  />
                  <button
                    onClick={() => testService('stt')}
                    disabled={testing.stt || !preferences.sttUrl}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testing.stt ? 'Testing...' : 'Test'}
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  URL for the Speech-to-Text service
                </p>
                {testResults.stt && (
                  <p className={`mt-2 text-sm ${testResults.stt.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.stt}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  STT API Key (Optional)
                </label>
                <ApiKeyInput
                  value={preferences.sttApiKey}
                  onChange={(value) => setPreferences({ ...preferences, sttApiKey: value })}
                  placeholder="Leave empty if not required"
                  envPlaceholder="env:WHISPER_API_KEY"
                  fieldName="sttApiKey"
                />
                <p className="mt-1 text-sm text-gray-600">
                  {preferences.sttApiKey?.startsWith('env:') 
                    ? 'Using environment variable for authentication'
                    : 'API key for authentication (leave empty for local/free services)'}
                </p>
              </div>

              <ModelSelector
                value={preferences.sttModel}
                onChange={(value) => setPreferences({ ...preferences, sttModel: value })}
                placeholder="Select or enter STT model"
                models={models.stt}
                loading={loadingModels.stt}
                error={modelErrors.stt}
                onRefresh={() => fetchModels('stt')}
                label="STT Model"
                description="Speech-to-text model for transcription (whisper models only)"
              />
            </div>
          </section>
        )}

        {/* Text-to-Speech Tab */}
        {activeTab === 'tts' && (
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Text-to-Speech (TTS) & Voice Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TTS Server URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={preferences.ttsUrl}
                    onChange={(e) => setPreferences({ ...preferences, ttsUrl: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://speaches.serveur.au"
                  />
                  <button
                    onClick={() => testService('tts')}
                    disabled={testing.tts || !preferences.ttsUrl}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testing.tts ? 'Testing...' : 'Test'}
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  URL for the Text-to-Speech service
                </p>
                {testResults.tts && (
                  <p className={`mt-2 text-sm ${testResults.tts.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.tts}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TTS API Key (Optional)
                </label>
                <ApiKeyInput
                  value={preferences.ttsApiKey}
                  onChange={(value) => setPreferences({ ...preferences, ttsApiKey: value })}
                  placeholder="Leave empty if not required"
                  envPlaceholder="env:TTS_API_KEY"
                  fieldName="ttsApiKey"
                />
                <p className="mt-1 text-sm text-gray-600">
                  {preferences.ttsApiKey?.startsWith('env:') 
                    ? 'Using environment variable for authentication'
                    : 'API key for authentication (leave empty for local/free services)'}
                </p>
              </div>

              <div className="border-t pt-4 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Voice
                </label>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="male"
                      checked={preferences.voice === 'male'}
                      onChange={(e) => setPreferences({ ...preferences, voice: e.target.value as 'male' | 'female' })}
                      className="mr-2"
                    />
                    <span>Male</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="female"
                      checked={preferences.voice === 'female'}
                      onChange={(e) => setPreferences({ ...preferences, voice: e.target.value as 'male' | 'female' })}
                      className="mr-2"
                    />
                    <span>Female</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TTS Speed
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="2.0"
                  value={preferences.ttsSpeed}
                  onChange={(e) => setPreferences({ ...preferences, ttsSpeed: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1.25"
                />
                <p className="mt-1 text-sm text-gray-600">
                  Speech synthesis speed (0.5 = slower, 1.0 = normal, 2.0 = faster)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ModelSelector
                  value={preferences.maleTTSModel}
                  onChange={(value) => setPreferences({ ...preferences, maleTTSModel: value })}
                  placeholder="Select or enter male TTS model"
                  models={models.tts}
                  loading={loadingModels.tts}
                  error={modelErrors.tts}
                  onRefresh={() => fetchModels('tts')}
                  label="Male TTS Model"
                  description="Model for male voice synthesis (non-whisper models)"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Male Voice ID
                  </label>
                  <input
                    type="text"
                    value={preferences.maleVoice}
                    onChange={(e) => setPreferences({ ...preferences, maleVoice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="alan"
                  />
                  <p className="mt-1 text-sm text-gray-600">
                    Voice ID for the male model
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ModelSelector
                  value={preferences.femaleTTSModel}
                  onChange={(value) => setPreferences({ ...preferences, femaleTTSModel: value })}
                  placeholder="Select or enter female TTS model"
                  models={models.tts}
                  loading={loadingModels.tts}
                  error={modelErrors.tts}
                  onRefresh={() => fetchModels('tts')}
                  label="Female TTS Model"
                  description="Model for female voice synthesis (non-whisper models)"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Female Voice ID
                  </label>
                  <input
                    type="text"
                    value={preferences.femaleVoice}
                    onChange={(e) => setPreferences({ ...preferences, femaleVoice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="amy"
                  />
                  <p className="mt-1 text-sm text-gray-600">
                    Voice ID for the female model
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Chat Model Tab */}
        {activeTab === 'chat' && (
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Chat Model Service</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chat API URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={preferences.ollamaUrl}
                    onChange={(e) => setPreferences({ ...preferences, ollamaUrl: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://api.openai.com/v1 or https://ollama.serveur.au"
                  />
                  <button
                    onClick={() => testService('chat')}
                    disabled={testing.chat || !preferences.ollamaUrl}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testing.chat ? 'Testing...' : 'Test'}
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  API endpoint (OpenAI, Anthropic, Ollama, or compatible service)
                </p>
                {testResults.chat && (
                  <p className={`mt-2 text-sm ${testResults.chat.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.chat}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chat API Key (Optional)
                </label>
                <ApiKeyInput
                  value={preferences.ollamaApiKey}
                  onChange={(value) => setPreferences({ ...preferences, ollamaApiKey: value })}
                  placeholder="sk-... or leave empty"
                  envPlaceholder="env:OPENAI_API_KEY"
                  fieldName="chatApiKey"
                />
                <p className="mt-1 text-sm text-gray-600">
                  {preferences.ollamaApiKey?.startsWith('env:') 
                    ? 'Using environment variable for authentication'
                    : 'API key for authentication (leave empty for local services)'}
                </p>
              </div>

              <ModelSelector
                value={preferences.ollamaModel}
                onChange={(value) => setPreferences({ ...preferences, ollamaModel: value })}
                placeholder="Select or enter chat model"
                models={models.chat}
                loading={loadingModels.chat}
                error={modelErrors.chat}
                onRefresh={() => fetchModels('chat')}
                label="Chat Model"
                description="Model name for chat completions (e.g., gpt-4, claude-3-opus, llama2)"
              />
              <div className="mt-2 text-xs text-gray-500">
                <p>• OpenAI: gpt-4, gpt-3.5-turbo</p>
                <p>• Anthropic: claude-3-opus-20240229, claude-3-sonnet-20240229</p>
                <p>• Ollama: llama2, mistral, phi</p>
              </div>
            </div>
          </section>
        )}

        {/* Data Management & Documentation Tab */}
        {activeTab === 'data' && (
          <div className="space-y-8">
            {/* Data Management */}
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Management</h2>
              <div className="flex gap-4">
                <button
                  onClick={exportData}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download size={20} />
                  Export Data
                </button>
                <button
                  onClick={importData}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Upload size={20} />
                  Import Data
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Export or import your scenarios, sessions, and preferences
              </p>
            </section>

            {/* Documentation Links */}
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Documentation</h2>
              <div className="space-y-2">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    window.electronAPI.shell.openExternal('https://speaches.serveur.au/docs');
                  }}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink size={16} />
                  Speaches API Documentation
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    window.electronAPI.shell.openExternal('https://ollama.ai');
                  }}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink size={16} />
                  Ollama Documentation
                </a>
              </div>
            </section>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={savePreferences}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}