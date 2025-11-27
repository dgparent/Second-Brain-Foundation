import React, { useState } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button, Space, Tooltip } from 'antd';
import { 
  BoldOutlined, 
  ItalicOutlined, 
  RobotOutlined, 
  SaveOutlined 
} from '@ant-design/icons';

interface SmartEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
}

const SmartEditor: React.FC<SmartEditorProps> = ({ initialContent = '', onSave }) => {
  const [isAiLoading, setIsAiLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing or type / for commands...',
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
        style: 'min-height: 300px; padding: 1rem; border: 1px solid #d9d9d9; border-radius: 8px;'
      },
    },
  });

  const handleAiAssist = async () => {
    if (!editor) return;
    
    const selection = editor.state.selection;
    const text = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    
    if (!text) {
      // If no text selected, maybe generate a continuation?
      // For now, just alert
      alert('Please select some text to summarize or improve.');
      return;
    }

    setIsAiLoading(true);
    try {
      const result = await window.sbfAPI.ai.generate({ prompt: `Improve this text (fix grammar, make it clearer): "${text}"` });
      
      // Replace the selection with the result
      editor.chain().focus().insertContent(result).run();
      setIsAiLoading(false);
    } catch (error) {
      console.error(error);
      setIsAiLoading(false);
    }
  };

  const handleAiAction = async (action: 'summarize' | 'shorter' | 'professional') => {
    if (!editor) return;
    const selection = editor.state.selection;
    const text = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    if (!text) return;

    setIsAiLoading(true);
    try {
      let prompt = '';
      switch (action) {
        case 'summarize': prompt = `Summarize this text: "${text}"`; break;
        case 'shorter': prompt = `Make this text shorter: "${text}"`; break;
        case 'professional': prompt = `Rewrite this text to be more professional: "${text}"`; break;
      }

      const result = await window.sbfAPI.ai.generate({ prompt });
      editor.chain().focus().insertContent(result).run();
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="smart-editor">
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Button 
          icon={<BoldOutlined />} 
          type={editor.isActive('bold') ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <Button 
          icon={<ItalicOutlined />} 
          type={editor.isActive('italic') ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <Button 
          icon={<RobotOutlined />} 
          loading={isAiLoading}
          onClick={handleAiAssist}
        >
          AI Assist
        </Button>
        <div style={{ flex: 1 }} />
        <Button 
          type="primary" 
          icon={<SaveOutlined />} 
          onClick={() => onSave?.(editor.getHTML())}
        >
          Save
        </Button>
      </div>

      <EditorContent editor={editor} />
      
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <Space style={{ background: 'white', padding: 4, borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
            <Button 
              size="small" 
              type="text" 
              icon={<BoldOutlined />}
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'is-active' : ''}
            />
            <Button 
              size="small" 
              type="text" 
              icon={<ItalicOutlined />}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'is-active' : ''}
            />
            <Tooltip title="Summarize">
              <Button 
                size="small" 
                type="text" 
                icon={<RobotOutlined />} 
                onClick={() => handleAiAction('summarize')}
              />
            </Tooltip>
            <Tooltip title="Make Shorter">
              <Button 
                size="small" 
                type="text" 
                onClick={() => handleAiAction('shorter')}
              >
                Short
              </Button>
            </Tooltip>
            <Tooltip title="Make Professional">
              <Button 
                size="small" 
                type="text" 
                onClick={() => handleAiAction('professional')}
              >
                Pro
              </Button>
            </Tooltip>
          </Space>
        </BubbleMenu>
      )}
    </div>
  );
};

export default SmartEditor;
