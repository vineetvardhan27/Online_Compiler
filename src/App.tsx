import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { Play, RotateCcw, Code2, Sun, Moon } from 'lucide-react';
import type { Language, CompilerState, Theme } from './types';
import { executeJavaScript } from './executors/javascript';
import { executePython } from './executors/python';

const INITIAL_CODE = {
  javascript: '// Example: Calculate factorial\nfunction factorial(n) {\n  return n <= 1 ? 1 : n * factorial(n - 1);\n}\n\nconsole.log(factorial(5));',
  python: '# Example: Calculate factorial\ndef factorial(n):\n    return 1 if n <= 1 else n * factorial(n - 1)\n\nprint(factorial(5))',
};

const INITIAL_STATE: CompilerState = {
  code: INITIAL_CODE.javascript,
  language: 'javascript',
  input: '',
  output: '',
  isRunning: false,
  error: null,
  theme: 'dark',
};

const LANGUAGE_EXTENSIONS = {
  javascript: [javascript()],
  python: [python()],
};

function App() {
  const [state, setState] = useState<CompilerState>(INITIAL_STATE);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  const handleThemeToggle = () => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const language = e.target.value as Language;
    setState(prev => ({ 
      ...prev, 
      language,
      code: INITIAL_CODE[language],
      output: '',
      error: null
    }));
  };

  const handleCodeChange = (value: string) => {
    setState(prev => ({ ...prev, code: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(prev => ({ ...prev, input: e.target.value }));
  };

  const handleReset = () => {
    setState(prev => ({
      ...INITIAL_STATE,
      theme: prev.theme,
      language: prev.language,
      code: INITIAL_CODE[prev.language],
    }));
  };

  const handleRun = async () => {
    setState(prev => ({ ...prev, isRunning: true, error: null, output: '' }));
    try {
      let output = '';
      const startTime = performance.now();

      switch (state.language) {
        case 'javascript':
          output = await executeJavaScript(state.code, state.input);
          break;
        case 'python':
          output = await executePython(state.code, state.input);
          break;
        default:
          throw new Error('Unsupported language');
      }

      const executionTime = (performance.now() - startTime).toFixed(2);
      
      setState(prev => ({
        ...prev,
        output: `${output}\n\nExecution time: ${executionTime}ms`,
        isRunning: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
        isRunning: false,
      }));
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${state.theme === 'dark' ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'}`}>
      <nav className={`border-b ${state.theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Code2 className="h-8 w-8 bg-gradient-to-r from-[#5b4bff] to-[#00ffe0] rounded-lg p-1.5" />
              <span className="text-xl font-semibold tracking-tight">Code Runner</span>
            </div>
            <button
              onClick={handleThemeToggle}
              className={`p-2 rounded-full transition-colors ${
                state.theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              {state.theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <select
                value={state.language}
                onChange={handleLanguageChange}
                className={`block w-40 rounded-xl border shadow-sm focus:ring-2 focus:ring-[#5b4bff] transition-colors ${
                  state.theme === 'dark'
                    ? 'bg-gray-900 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
              </select>
              <div className="space-x-2">
                <button
                  onClick={handleRun}
                  disabled={state.isRunning}
                  className={`inline-flex items-center px-4 py-2 rounded-xl font-medium shadow-sm transition-all ${
                    state.isRunning
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:opacity-90 active:scale-95'
                  } bg-gradient-to-r from-[#5b4bff] to-[#00ffe0] text-white`}
                >
                  <Play className={`h-4 w-4 mr-2 ${state.isRunning ? 'animate-spin' : ''}`} />
                  Run
                </button>
                <button
                  onClick={handleReset}
                  className={`inline-flex items-center px-4 py-2 rounded-xl font-medium shadow-sm transition-all hover:opacity-90 active:scale-95 ${
                    state.theme === 'dark'
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </button>
              </div>
            </div>

            <div className={`rounded-xl overflow-hidden border ${
              state.theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
            }`}>
              <CodeMirror
                value={state.code}
                height="400px"
                theme={state.theme === 'dark' ? oneDark : undefined}
                extensions={LANGUAGE_EXTENSIONS[state.language]}
                onChange={handleCodeChange}
              />
            </div>

            <div>
              <label htmlFor="input" className="block text-sm font-medium mb-2">
                Input
              </label>
              <textarea
                id="input"
                rows={4}
                value={state.input}
                onChange={handleInputChange}
                className={`w-full rounded-xl shadow-sm transition-colors ${
                  state.theme === 'dark'
                    ? 'bg-gray-900 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter input here (optional)"
              />
            </div>
          </div>

          <div>
            <div className={`rounded-xl p-6 border ${
              state.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            }`}>
              <h2 className="text-lg font-medium mb-4">Output</h2>
              {state.error ? (
                <pre className={`p-4 rounded-xl overflow-auto font-mono text-sm ${
                  state.theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-500'
                }`}>
                  {state.error}
                </pre>
              ) : (
                <pre className={`p-4 rounded-xl overflow-auto min-h-[200px] font-mono text-sm ${
                  state.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  {state.output || 'Run your code to see the output here'}
                </pre>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;