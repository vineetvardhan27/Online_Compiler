import { loadPyodide } from 'pyodide';

let pyodide: any = null;

async function initializePyodide() {
  if (!pyodide) {
    pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
    });
  }
  return pyodide;
}

export async function executePython(code: string, input: string): Promise<string> {
  try {
    const pyodideInstance = await initializePyodide();
    
    // Set up input handling
    pyodideInstance.runPython(`
      import sys
      from io import StringIO
      sys.stdin = StringIO(${JSON.stringify(input)})
      sys.stdout = StringIO()
    `);

    // Execute the code
    await pyodideInstance.runPythonAsync(code);
    
    // Get the output
    const output = pyodideInstance.runPython('sys.stdout.getvalue()');
    
    // Reset stdout
    pyodideInstance.runPython(`
      sys.stdout = sys.__stdout__
      sys.stdin = sys.__stdin__
    `);

    return output;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'An error occurred');
  }
}