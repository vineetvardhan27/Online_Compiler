export async function executeJavaScript(code: string, input: string): Promise<string> {
  try {
    // Create a sandboxed context with captured console output
    const outputs: string[] = [];
    const originalConsole = { ...console };
    
    // Override console methods to capture output
    const consoleMethods = ['log', 'info', 'warn', 'error'] as const;
    consoleMethods.forEach(method => {
      console[method] = (...args: any[]) => {
        outputs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };
    });

    // Create a safe context with input handling
    const context = {
      input,
      console,
      setTimeout,
      clearTimeout,
      Promise,
      Date,
      Math,
      Number,
      String,
      Array,
      Object,
      JSON,
      Error,
    };

    // Wrap code in async function to support await
    const wrappedCode = `
      (async function(input) {
        try {
          ${code}
        } catch (error) {
          console.error(error.message);
        }
      })(${JSON.stringify(input)})
    `;

    // Execute the code
    await eval(wrappedCode);

    // Restore original console
    consoleMethods.forEach(method => {
      console[method] = originalConsole[method];
    });

    return outputs.join('\n');
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'An error occurred');
  }
}