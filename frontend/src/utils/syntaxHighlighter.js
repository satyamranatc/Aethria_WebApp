import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-yaml';

export function highlightCode(code, language = 'javascript') {
  if (!code) return '';
  const rawLang = (language || 'javascript').toLowerCase().trim();

  let grammar = Prism.languages[rawLang];
  let langId = rawLang;

  if (!grammar) {
    if (rawLang === 'html' || rawLang === 'xml' || rawLang === 'svg') {
      grammar = Prism.languages.markup;
      langId = 'markup';
    } else if (rawLang === 'js') {
      grammar = Prism.languages.javascript;
      langId = 'javascript';
    } else if (rawLang === 'ts') {
      grammar = Prism.languages.typescript;
      langId = 'typescript';
    } else if (rawLang === 'py') {
      grammar = Prism.languages.python;
      langId = 'python';
    } else if (rawLang === 'sh' || rawLang === 'shell' || rawLang === 'zsh') {
      grammar = Prism.languages.bash;
      langId = 'bash';
    } else if (rawLang === 'yml') {
      grammar = Prism.languages.yaml;
      langId = 'yaml';
    } else {
      grammar = Prism.languages.javascript || Prism.languages.markup;
      langId = 'javascript';
    }
  }

  try {
    return Prism.highlight(code, grammar, langId);
  } catch {
    return code;
  }
}
