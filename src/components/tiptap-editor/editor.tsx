import { useEffect, useRef, useState } from 'react';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Selection } from '@tiptap/extensions';
import { type Content, EditorContent, EditorContext, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import css from 'highlight.js/lib/languages/css';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import go from 'highlight.js/lib/languages/go';
import js from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import md from 'highlight.js/lib/languages/markdown';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import ts from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import { all, createLowlight } from 'lowlight';

import {
    ArrowLeftIcon,
    BlockquoteButton,
    Button,
    CodeBlockButton,
    ColorHighlightPopover,
    ColorHighlightPopoverButton,
    ColorHighlightPopoverContent,
    HeadingDropdownMenu,
    HighlighterIcon,
    HorizontalRule,
    LinkButton,
    LinkContent,
    LinkIcon,
    LinkPopover,
    ListDropdownMenu,
    MarkButton,
    Spacer,
    TextAlignButton,
    ThemeToggle,
    Toolbar,
    ToolbarGroup,
    ToolbarSeparator,
    UndoRedoButton
} from '@/components';

import { useIsMobile } from '@/hooks/use-mobile';

import '@/components/tiptap-editor/editor.scss';
import '@/components/tiptap-node/blockquote-node/blockquote-node.scss';
import '@/components/tiptap-node/code-block-node/code-block-node.scss';
import '@/components/tiptap-node/heading-node/heading-node.scss';
import '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss';
import '@/components/tiptap-node/image-node/image-node.scss';
import '@/components/tiptap-node/list-node/list-node.scss';
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss';

const lowlight = createLowlight(all);

lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('js', js);
lowlight.register('ts', ts);
lowlight.register('sh', bash);
lowlight.register('c', c);
lowlight.register('cpp', cpp);
lowlight.register('md', md);
lowlight.register('dockerfile', dockerfile);
lowlight.register('go', go);
lowlight.register('json', json);
lowlight.register('sql', sql);
lowlight.register('rust', rust);

export function Editor() {
    const isMobile = useIsMobile();
    const [mobileView, setMobileView] = useState<'main' | 'highlighter' | 'link'>('main');
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [editorState, setEditorState] = useState<Content>({});

    const editor = useEditor({
        immediatelyRender: false,
        shouldRerenderOnTransaction: false,
        editorProps: {
            attributes: {
                autocomplete: 'off',
                autocorrect: 'off',
                autocapitalize: 'off',
                'aria-label': 'Main content area, start typing to enter text.',
                class: 'editor'
            }
        },
        extensions: [
            StarterKit.configure({
                horizontalRule: false,
                codeBlock: false,
                link: {
                    openOnClick: false,
                    enableClickSelection: true
                }
            }),
            HorizontalRule,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Highlight.configure({ multicolor: true }),
            Image,
            Typography,
            Superscript,
            Subscript,
            Selection,
            CodeBlockLowlight.configure({
                lowlight,
                languageClassPrefix: 'language-',
                defaultLanguage: 'plaintext'
            })
        ],
        content: editorState,
        onCreate: (props) => {
            setEditorState(props.editor.getJSON());
            console.log(props.editor.getJSON());
        },
        onUpdate: (props) => {
            console.log(props.editor.getJSON());
        }
    });

    useEffect(() => {
        if (!isMobile && mobileView !== 'main') {
            setMobileView('main');
        }
    }, [isMobile, mobileView]);

    return (
        <div className="editor-wrapper">
            <EditorContext.Provider value={{ editor }}>
                <Toolbar
                    ref={toolbarRef}
                    style={{
                        ...(isMobile
                            ? {
                                  bottom: 0
                              }
                            : {})
                    }}
                >
                    {mobileView === 'main' ? (
                        <MainToolbarContent
                            onHighlighterClick={() => setMobileView('highlighter')}
                            onLinkClick={() => setMobileView('link')}
                            isMobile={isMobile}
                        />
                    ) : (
                        <MobileToolbarContent
                            type={mobileView === 'highlighter' ? 'highlighter' : 'link'}
                            onBack={() => setMobileView('main')}
                        />
                    )}
                </Toolbar>

                <EditorContent editor={editor} role="presentation" className="editor-content" />
            </EditorContext.Provider>
        </div>
    );
}

function MainToolbarContent({
    onHighlighterClick,
    onLinkClick,
    isMobile
}: {
    onHighlighterClick: () => void;
    onLinkClick: () => void;
    isMobile: boolean;
}) {
    return (
        <>
            <Spacer />

            <ToolbarGroup>
                <UndoRedoButton action="undo" />
                <UndoRedoButton action="redo" />
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup>
                <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
                <ListDropdownMenu types={['bulletList', 'orderedList', 'taskList']} portal={isMobile} />
                <BlockquoteButton />
                <CodeBlockButton />
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup>
                <MarkButton type="bold" />
                <MarkButton type="italic" />
                <MarkButton type="strike" />
                <MarkButton type="code" />
                <MarkButton type="underline" />
                {!isMobile ? <ColorHighlightPopover /> : <ColorHighlightPopoverButton onClick={onHighlighterClick} />}
                {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup>
                <MarkButton type="superscript" />
                <MarkButton type="subscript" />
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup>
                <TextAlignButton align="left" />
                <TextAlignButton align="center" />
                <TextAlignButton align="right" />
                <TextAlignButton align="justify" />
            </ToolbarGroup>

            <ToolbarSeparator />

            <Spacer />

            {isMobile && <ToolbarSeparator />}

            <ToolbarGroup>
                <ThemeToggle />
            </ToolbarGroup>
        </>
    );
}

function MobileToolbarContent({ type, onBack }: { type: 'highlighter' | 'link'; onBack: () => void }) {
    return (
        <>
            <ToolbarGroup>
                <Button data-style="ghost" onClick={onBack}>
                    <ArrowLeftIcon className="tiptap-button-icon" />
                    {type === 'highlighter' ? (
                        <HighlighterIcon className="tiptap-button-icon" />
                    ) : (
                        <LinkIcon className="tiptap-button-icon" />
                    )}
                </Button>
            </ToolbarGroup>

            <ToolbarSeparator />

            {type === 'highlighter' ? <ColorHighlightPopoverContent /> : <LinkContent />}
        </>
    );
}
