// codemirror-setup.js — creates the CodeMirror 6 editor with SQL support.
//
// CodeMirror 6 is modular: you compose features by adding "extensions".
// We use:
//   - basicSetup: line numbers, bracket matching, undo/redo, etc.
//   - sql({ dialect: SQLite, schema }): SQL syntax highlighting + autocomplete
//   - EditorView.theme(): visual styling to match our noir palette
//   - keymap: Ctrl+Enter shortcut to run the query
//
// The import map in index.html tells the browser where to find each module
// (from the esm.sh CDN). We import only what we need here.

import { EditorView, basicSetup } from 'codemirror';
import { keymap }                 from '@codemirror/view';
import { EditorState, Prec }      from '@codemirror/state';
import { sql, SQLite }            from '@codemirror/lang-sql';
import { acceptCompletion, completionStatus } from '@codemirror/autocomplete';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags }                   from '@lezer/highlight';

// Syntax colours tuned for the dark amber palette. CodeMirror's default
// highlight style targets light backgrounds (dark purple keywords), which
// is unreadable here.
const noirHighlight = HighlightStyle.define([
  { tag: tags.keyword,                     color: '#e8b04a', fontWeight: '700' },
  { tag: [tags.string, tags.special(tags.string)], color: '#9ccf7a' },
  { tag: [tags.number, tags.bool, tags.null], color: '#e2876b' },
  { tag: tags.comment,                     color: '#6b5a38', fontStyle: 'italic' },
  { tag: [tags.operator, tags.punctuation], color: '#a89868' },
  { tag: [tags.name, tags.propertyName],   color: '#e8dcc0' },
  { tag: tags.typeName,                    color: '#d9a3e0' },
]);

/**
 * Mounts a CodeMirror editor into `element`.
 *
 * @param {HTMLElement} element  - the container div (empty)
 * @param {object}      schema   - { tableName: ['col1', 'col2'], ... }
 *                                 used for SQL autocomplete suggestions
 * @param {Function}    onRun    - called with the SQL string when the user
 *                                 presses Run or Ctrl+Enter
 * @returns {EditorView}  the editor instance (keep it to read content later)
 */
export function initEditor(element, schema, onRun) {
  const extensions = [
    basicSetup,

    // SQL language support: syntax highlighting + autocomplete.
    // `schema` tells the extension which tables and columns exist so it
    // can suggest them as the player types.
    sql({ dialect: SQLite, schema }),
    syntaxHighlighting(noirHighlight),

    // Visual theme — overrides CodeMirror's default light styling to match
    // our dark amber palette. Only structural styles go here; syntax colours
    // come from noirHighlight above.
    EditorView.theme({
      '&': {
        backgroundColor: 'transparent',
        color:           'var(--text-primary)',
        fontSize:        'var(--text-base)',
        fontFamily:      'var(--font-mono)',
        height:          '100%',
      },
      '.cm-content': {
        padding:    '12px 8px',
        caretColor: 'var(--accent)',
      },
      '.cm-cursor': {
        borderLeftColor: 'var(--accent)',
      },
      // Text selection background
      '.cm-selectionBackground, ::selection': {
        backgroundColor: 'rgba(212, 168, 67, 0.2) !important',
      },
      '&.cm-focused .cm-selectionBackground': {
        backgroundColor: 'rgba(212, 168, 67, 0.25) !important',
      },
      // Highlight the line the cursor is on
      '.cm-activeLine': {
        backgroundColor: 'rgba(200, 168, 75, 0.05)',
      },
      // Line-number gutter
      '.cm-gutters': {
        backgroundColor: 'var(--panel)',
        color:           'var(--text-dim)',
        border:          'none',
        borderRight:     '1px solid var(--border)',
      },
      '.cm-activeLineGutter': {
        backgroundColor: 'rgba(200, 168, 75, 0.05)',
        color:           'var(--text-secondary)',
      },
      // Autocomplete popup — boosted contrast so suggestions read
      // clearly against the dark amber background
      '.cm-tooltip': {
        backgroundColor: '#241e16',
        border:          '1px solid #6b5226',
        color:           '#f0e6cf',
        boxShadow:       '0 4px 14px rgba(0, 0, 0, 0.6)',
      },
      '.cm-tooltip.cm-tooltip-autocomplete > ul': {
        fontFamily:      'var(--font-mono)',
        fontSize:        'var(--text-sm)',
        maxHeight:       '14em',
      },
      '.cm-tooltip.cm-tooltip-autocomplete > ul > li': {
        padding:         '3px 8px',
        color:           '#f0e6cf',
      },
      '.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]': {
        backgroundColor: '#d4a843',
        color:           '#100c06',
      },
      '.cm-completionLabel': {
        color:           'inherit',
      },
      '.cm-completionDetail': {
        color:           '#a89868',
        fontStyle:       'normal',
        marginLeft:      '8px',
      },
      '.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected] .cm-completionDetail': {
        color:           '#3a2c0a',
      },
      '.cm-completionMatchedText': {
        color:           '#ffd76a',
        textDecoration:  'none',
        fontWeight:      '700',
      },
      '.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected] .cm-completionMatchedText': {
        color:           '#100c06',
        textDecoration:  'underline',
      },
      // Make the editor scrollbar match the theme
      '.cm-scroller': {
        overflowY: 'auto',
      },
    }, { dark: true }),

    // Keyboard shortcuts. Wrapped in Prec.highest because basicSetup's
    // defaultKeymap binds Mod-Enter to insertBlankLine — without raising
    // precedence, that handler swallows our Ctrl+Enter.
    Prec.highest(
      keymap.of([
        {
          key: 'Tab',
          run: (view) => {
            if (completionStatus(view.state) === 'active') {
              return acceptCompletion(view);
            }
            return false;
          },
        },
        {
          key:  'Ctrl-Enter',
          mac:  'Cmd-Enter',
          run:  (view) => {
            onRun(view.state.doc.toString());
            return true;
          },
        },
      ])
    ),
  ];

  const state = EditorState.create({
    // Starter query — gives the player an immediate win on first load
    doc: 'SELECT name, alias, occupation\nFROM people\nORDER BY name;',
    extensions,
  });

  return new EditorView({ state, parent: element });
}

/**
 * Returns the current text content of the editor.
 * @param {EditorView} view
 * @returns {string}
 */
export function getEditorContent(view) {
  return view.state.doc.toString();
}

/**
 * Replaces the editor content (e.g. to set an example query from a hint).
 * @param {EditorView} view
 * @param {string}     text
 */
export function setEditorContent(view, text) {
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: text },
  });
}
