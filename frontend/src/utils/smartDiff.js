/**
 * Smart Diff Engine - Virtual DOM-like diffing for code synchronization
 * Uses Myers Diff Algorithm (similar to git diff) for optimal performance
 */

/**
 * Calculate smart diff between original, current VS Code state, and edited code
 * @param {string} original - Last known synchronized state
 * @param {string} current - Current VS Code state
 * @param {string} edited - Web app edited state
 * @returns {Object} - { editScript, conflicts, stats }
 */
export function calculateSmartDiff(original, current, edited) {
  const originalLines = original.split('\n');
  const currentLines = current.split('\n');
  const editedLines = edited.split('\n');
  
  // Step 1: Calculate hash for each line for fast comparison
  const originalHashes = originalLines.map(hashLine);
  const currentHashes = currentLines.map(hashLine);
  const editedHashes = editedLines.map(hashLine);
  
  // Step 2: Find common subsequences (LCS - Longest Common Subsequence)
  const lcs = findLCS(originalHashes, editedHashes);
  
  // Step 3: Generate minimal edit script
  const editScript = generateEditScript(originalLines, editedLines, lcs);
  
  // Step 4: Check for conflicts with current VS Code state
  const conflicts = detectConflicts(originalLines, currentLines, editScript);
  
  return {
    editScript,
    conflicts,
    stats: {
      added: editScript.filter(e => e.type === 'insert').length,
      deleted: editScript.filter(e => e.type === 'delete').length,
      modified: editScript.filter(e => e.type === 'replace').length
    }
  };
}

/**
 * Fast line hashing using FNV-1a algorithm
 * @param {string} line - Line of code to hash
 * @returns {number} - Hash value
 */
function hashLine(line) {
  let hash = 2166136261;
  for (let i = 0; i < line.length; i++) {
    hash ^= line.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Find Longest Common Subsequence using Dynamic Programming
 * @param {number[]} arr1 - First array of hashes
 * @param {number[]} arr2 - Second array of hashes
 * @returns {Array} - LCS positions
 */
function findLCS(arr1, arr2) {
  const m = arr1.length;
  const n = arr2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  // Build DP table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  // Backtrack to find actual sequence
  const lcs = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (arr1[i - 1] === arr2[j - 1]) {
      lcs.unshift({ i: i - 1, j: j - 1 });
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  
  return lcs;
}

/**
 * Generate minimal edit script from LCS
 * @param {string[]} originalLines - Original code lines
 * @param {string[]} editedLines - Edited code lines
 * @param {Array} lcs - Longest common subsequence
 * @returns {Array} - Edit operations
 */
function generateEditScript(originalLines, editedLines, lcs) {
  const edits = [];
  let origIdx = 0, editIdx = 0, lcsIdx = 0;
  
  while (origIdx < originalLines.length || editIdx < editedLines.length) {
    if (lcsIdx < lcs.length && 
        origIdx === lcs[lcsIdx].i && 
        editIdx === lcs[lcsIdx].j) {
      // Lines match - no change needed
      origIdx++;
      editIdx++;
      lcsIdx++;
    } else if (lcsIdx < lcs.length && origIdx < lcs[lcsIdx].i) {
      // Line deleted
      edits.push({
        type: 'delete',
        line: origIdx + 1,
        content: originalLines[origIdx]
      });
      origIdx++;
    } else if (lcsIdx < lcs.length && editIdx < lcs[lcsIdx].j) {
      // Line inserted
      edits.push({
        type: 'insert',
        line: origIdx + 1,
        content: editedLines[editIdx]
      });
      editIdx++;
    } else {
      // End of LCS - handle remaining
      if (origIdx < originalLines.length && editIdx < editedLines.length) {
        // Both have remaining - this is a replacement
        edits.push({
          type: 'replace',
          line: origIdx + 1,
          oldContent: originalLines[origIdx],
          content: editedLines[editIdx]
        });
        origIdx++;
        editIdx++;
      } else if (origIdx < originalLines.length) {
        edits.push({
          type: 'delete',
          line: origIdx + 1,
          content: originalLines[origIdx]
        });
        origIdx++;
      } else if (editIdx < editedLines.length) {
        edits.push({
          type: 'insert',
          line: origIdx + 1,
          content: editedLines[editIdx]
        });
        editIdx++;
      }
    }
  }
  
  return edits;
}

/**
 * Detect conflicts between web edits and VS Code changes
 * @param {string[]} originalLines - Original code lines
 * @param {string[]} currentLines - Current VS Code lines
 * @param {Array} editScript - Planned edits
 * @returns {Array} - Conflicts found
 */
function detectConflicts(originalLines, currentLines, editScript) {
  const conflicts = [];
  
  for (const edit of editScript) {
    const lineIdx = edit.line - 1;
    
    if (lineIdx < currentLines.length && lineIdx < originalLines.length) {
      const currentLine = currentLines[lineIdx];
      const originalLine = originalLines[lineIdx];
      
      // If VS Code line differs from original AND our edit differs
      if (currentLine !== originalLine && 
          edit.type !== 'insert' && 
          currentLine !== edit.content) {
        conflicts.push({
          line: edit.line,
          original: originalLine,
          vscodeVersion: currentLine,
          webAppVersion: edit.content,
          resolution: 'manual'
        });
      }
    }
  }
  
  return conflicts;
}

/**
 * Resolve conflicts based on strategy
 * @param {Array} conflicts - Detected conflicts
 * @param {string} strategy - 'prefer-webapp' or 'prefer-vscode'
 * @returns {Array} - Resolved conflicts
 */
export function resolveConflicts(conflicts, strategy = 'prefer-webapp') {
  return conflicts.map(conflict => ({
    ...conflict,
    resolved: strategy === 'prefer-webapp' 
      ? conflict.webAppVersion 
      : conflict.vscodeVersion
  }));
}

/**
 * Apply conflict resolutions to edit script
 * @param {Array} editScript - Original edit script
 * @param {Array} resolvedConflicts - Resolved conflicts
 * @returns {Array} - Updated edit script
 */
export function applyResolutions(editScript, resolvedConflicts) {
  const conflictMap = new Map(
    resolvedConflicts.map(c => [c.line, c.resolved])
  );
  
  return editScript.map(edit => {
    if (conflictMap.has(edit.line)) {
      return {
        ...edit,
        content: conflictMap.get(edit.line)
      };
    }
    return edit;
  });
}

/**
 * Generate hash for entire code block
 * @param {string} code - Code to hash
 * @returns {string} - Hash string
 */
export function hashCode(code) {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    const char = code.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}
