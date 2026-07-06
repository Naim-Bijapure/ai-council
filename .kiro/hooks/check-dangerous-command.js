// Read JSON input from stdin
let data = '';
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  try {
    const ctx = JSON.parse(data);
    const cmd = ctx.toolInput?.command || '';
    
    // Dangerous patterns that require confirmation
    const dangerousPatterns = [
      // File deletion
      /\brm\s+(-[rf]+\s|-[rf]+$)/i,
      /\brm\s+.*\s-[rf]/i,
      /\brmdir\s+/i,
      
      // Disk/System operations
      /\bdd\s+if=/i,
      /\bmkfs\b/i,
      /\bfdisk\b/i,
      /:(){ :|:& };:/,
      
      // Permission changes
      /\bchmod\s+(-R\s+)?777/i,
      /\bchown\s+-R\b/i,
      
      // Remote script execution
      /\bwget\b.*\|.*\bsh\b/i,
      /\bcurl\b.*\|.*\bsh\b/i,
      
      // Dangerous git operations
      /\bgit\s+push.*--force\b/i,
      /\bgit\s+reset\s+--hard\b/i,
      /\bgit\s+clean\s+-[fdx]/i,
      /\bgit\s+push.*--delete\b/i,
      /\bgit\s+branch\s+-D\b/i,
      
      // Database operations
      /\bdrop\s+(table|database)\b/i,
      /\btruncate\s+table\b/i,
      
      // Privilege escalation
      /^\s*su\s*$/i,
      /\bsudo\s+su\b/i,
      
      // Reverse shells
      /\bnc\s+.*-e\b/i,
      /\bncat\s+.*-e\b/i
    ];
    
    const isDangerous = dangerousPatterns.some(p => p.test(cmd));
    
    const result = {
      hookSpecificOutput: {
        permissionDecision: isDangerous ? 'ask' : 'allow',
        permissionDecisionReason: isDangerous 
          ? 'Dangerous command pattern detected. Please confirm.' 
          : 'Command auto-approved'
      }
    };
    
    console.log(JSON.stringify(result));
  } catch (e) {
    // On error, default to allow
    console.log(JSON.stringify({
      hookSpecificOutput: {
        permissionDecision: 'allow',
        permissionDecisionReason: 'Auto-approved (error in check)'
      }
    }));
  }
  
  process.exit(0);
});
