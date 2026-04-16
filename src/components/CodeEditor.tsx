import { useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { Code, Save } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
  onSave?: () => void;
  title?: string;
}

export const CodeEditor = ({
  value,
  onChange,
  language = 'yaml',
  height = '600px',
  readOnly = false,
  onSave,
  title = 'Code Editor',
}: CodeEditorProps) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;

    // Configure Monaco theme for dark/black background
    monaco.editor.defineTheme('vortex-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', background: '000000', foreground: 'ffffff' },
        { token: 'comment', foreground: '6b7280' },
        { token: 'string', foreground: 'f59e0b' },
        { token: 'number', foreground: '3b82f6' },
        { token: 'keyword', foreground: 'ec4899' },
      ],
      colors: {
        'editor.background': '#000000',
        'editor.foreground': '#ffffff',
        'editor.lineHighlightBackground': '#1a1a1a',
        'editor.selectionBackground': '#3b82f650',
        'editorCursor.foreground': '#f59e0b',
        'editorWhitespace.foreground': '#2a2a2a',
        'editorIndentGuide.activeBackground': '#3a3a3a',
        'editorIndentGuide.background': '#2a2a2a',
        'editorLineNumber.foreground': '#4b5563',
        'editorLineNumber.activeForeground': '#f59e0b',
        'editor.selectionHighlightBackground': '#3b82f620',
        'editor.findMatchBackground': '#3b82f650',
        'editor.findMatchHighlightBackground': '#3b82f630',
      },
    });

    monaco.editor.setTheme('vortex-dark');

    // Enable search with Cmd+F / Ctrl+F
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      editor.getContribution('editor.contrib.findController')?.startFind({
        searchString: editor.getModel()?.getValueInRange(editor.getSelection()) || '',
      });
    });

    // Enable save with Cmd+S / Ctrl+S
    if (onSave && !readOnly) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        onSave();
      });
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    }
  };

  return (
    <div className="bg-black border border-slate-900 rounded-lg overflow-hidden flex flex-col h-full">
      {/* Editor Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Code className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-white">{title}</span>
          <span className="text-xs text-slate-400 uppercase">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          {!readOnly && onSave && (
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
            >
              <Save className="w-3 h-3" />
              Save
            </button>
          )}
          <div className="text-xs text-slate-500 px-2 flex items-center gap-2">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">Ctrl+F</kbd>
            <span>to search,</span>
            {!readOnly && onSave && (
              <>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">Ctrl+S</kbd>
                <span>to save</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="relative w-full h-full">
        <Editor
          height={height}
          language={language}
          value={value}
          onChange={onChange}
          onMount={handleEditorDidMount}
          theme="vortex-dark"
          options={{
            readOnly,
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            formatOnPaste: true,
            formatOnType: true,
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            fontLigatures: true,
            bracketPairColorization: {
              enabled: true,
            },
            guides: {
              indentation: true,
              bracketPairs: true,
            },
          }}
        />
      </div>
    </div>
  );
};

