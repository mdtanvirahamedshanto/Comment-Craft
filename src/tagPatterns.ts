/**
 * Tag pattern definitions with canonical mapping
 * Supports both text-based tags (TODO, FIXME) and symbol-based tags (!, ?, *)
 */

export interface TagDefinition {
    tag: string;
    pattern: string;
    color: string;
    backgroundColor?: string;
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    aliases?: string[];
    symbols?: string[];
}

/**
 * Canonical tag definitions with symbols and aliases
 */
export const CANONICAL_TAGS: TagDefinition[] = [
    {
        tag: 'TODO',
        pattern: '(^|\\s)(☐|➤|•|📌)?\\s*@?(TODO|todo|@todo)\\b\\s*[:\\-]?',
        color: '#d19a66', // Mustard
        bold: true,
        aliases: ['todo', '@todo', 'TODO:'],
        symbols: ['☐', '➤', '•', '📌']
    },
    {
        tag: 'FIXME',
        pattern: '(^|\\s)(🔧|❗|🛠)?\\s*@?(FIXME|fixme|FIX|fix|@fixme)\\b\\s*[:\\-]?',
        color: '#e06c75', // Red
        backgroundColor: '#2a1f1f',
        bold: false,
        aliases: ['fixme', '@fixme', 'FIX', 'fix'],
        symbols: ['🔧', '❗', '🛠']
    },
    {
        tag: 'BUG',
        pattern: '(^|\\s)(🐞|✖|⛔)?\\s*@?(BUG|bug|@bug|defect|DEFECT)\\b\\s*[:\\-]?',
        color: '#e06c75', // Red
        backgroundColor: '#2a1f1f',
        bold: true,
        aliases: ['bug', '@bug', 'defect', 'DEFECT'],
        symbols: ['🐞', '✖', '⛔']
    },
    {
        tag: 'NOTE',
        pattern: '(^|\\s)(ℹ|📝|📄)?\\s*@?(NOTE|note|@note|info|INFO)\\b\\s*[:\\-]?',
        color: '#e91e63', // Pink
        bold: false,
        aliases: ['note', '@note', 'info', 'INFO'],
        symbols: ['ℹ', '📝', '📄']
    },
    {
        tag: 'HACK',
        pattern: '(^|\\s)(⚠|☢|🚧)?\\s*@?(HACK|hack|@hack|workaround|WORKAROUND)\\b\\s*[:\\-]?',
        color: '#f39c12', // Yellow
        italic: true,
        aliases: ['hack', '@hack', 'workaround', 'WORKAROUND'],
        symbols: ['⚠', '☢', '🚧']
    },
    {
        tag: 'OPTIMIZE',
        pattern: '(^|\\s)(⚡|📈|🚀)?\\s*@?(OPTIMIZE|optimize|@optimize|perf|PERF|performance|PERFORMANCE)\\b\\s*[:\\-]?',
        color: '#f1c40f', // Yellow
        bold: false,
        aliases: ['optimize', '@optimize', 'perf', 'PERF', 'performance', 'PERFORMANCE'],
        symbols: ['⚡', '📈', '🚀']
    },
    {
        tag: 'URGENT',
        pattern: '(^|\\s)(🚨|🔥|‼)?\\s*@?(URGENT|urgent|@urgent|critical|CRITICAL|hotfix|HOTFIX)\\b\\s*[:\\-]?',
        color: '#ffffff', // White
        backgroundColor: '#d9534f', // Red background
        bold: true,
        aliases: ['urgent', '@urgent', 'critical', 'CRITICAL', 'hotfix', 'HOTFIX'],
        symbols: ['🚨', '🔥', '‼']
    },
    {
        tag: 'REVIEW',
        pattern: '(^|\\s)(👀|🔍|🧐)?\\s*@?(REVIEW|review|@review|check|CHECK|audit|AUDIT)\\b\\s*[:\\-]?',
        color: '#3498DB', // Blue
        bold: false,
        aliases: ['review', '@review', 'check', 'CHECK', 'audit', 'AUDIT'],
        symbols: ['👀', '🔍', '🧐']
    },
    {
        tag: 'DEPRECATED',
        pattern: '(^|\\s)(☠|🗑|⚰)?\\s*@?(DEPRECATED|deprecated|@deprecated|obsolete|OBSOLETE)\\b\\s*[:\\-]?',
        color: '#9b59b6', // Purple
        strikethrough: true,
        aliases: ['deprecated', '@deprecated', 'obsolete', 'OBSOLETE'],
        symbols: ['☠', '🗑', '⚰']
    },
    {
        tag: 'DONE',
        pattern: '(^|\\s)(✔|✅|☑)?\\s*@?(DONE|done|@done|resolved|RESOLVED)\\b\\s*[:\\-]?',
        color: '#98C379', // Green
        bold: false,
        aliases: ['done', '@done', 'resolved', 'RESOLVED'],
        symbols: ['✔', '✅', '☑']
    },
    {
        tag: 'COMPLETE',
        pattern: '(^|\\s)(🏁|🎉|✓✓)?\\s*@?(COMPLETE|complete|@complete|finished|FINISHED)\\b\\s*[:\\-]?',
        color: '#98C379', // Green
        bold: false,
        aliases: ['complete', '@complete', 'finished', 'FINISHED'],
        symbols: ['🏁', '🎉', '✓✓']
    },
    // Symbol-based tags
    {
        tag: '!',
        pattern: '(^|\\s)!\\s*[:\\-]?',
        color: '#FF2D00', // Red
        bold: true,
        aliases: ['BUG', 'FIXME', 'URGENT']
    },
    {
        tag: '?',
        pattern: '(^|\\s)\\?\\s*[:\\-]?',
        color: '#3498DB', // Blue
        bold: false,
        aliases: ['REVIEW', 'QUESTION']
    },
    {
        tag: '*',
        pattern: '(^|\\s)\\*\\s*[:\\-]?',
        color: '#98C379', // Green
        bold: false,
        aliases: ['DONE', 'COMPLETE']
    },
    {
        tag: '^',
        pattern: '(^|\\s)\\^\\s*[:\\-]?',
        color: '#f1c40f', // Yellow
        bold: false,
        aliases: ['OPTIMIZE', 'HACK', 'IMPROVE']
    },
    {
        tag: '&',
        pattern: '(^|\\s)&\\s*[:\\-]?',
        color: '#e91e63', // Pink
        bold: false,
        aliases: ['NOTE', 'INFO']
    },
    {
        tag: '~',
        pattern: '(^|\\s)~\\s*[:\\-]?',
        color: '#9b59b6', // Purple
        strikethrough: true,
        aliases: ['DEPRECATED']
    }
];

/**
 * Get default tag configuration for package.json
 */
export function getDefaultTags(): any[] {
    return CANONICAL_TAGS.map(tag => ({
        tag: tag.tag,
        pattern: tag.pattern,
        color: tag.color,
        backgroundColor: tag.backgroundColor || 'transparent',
        bold: tag.bold || false,
        italic: tag.italic || false,
        strikethrough: tag.strikethrough || false,
        underline: tag.underline || false
    }));
}

