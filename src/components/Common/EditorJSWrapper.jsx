// src/components/common/EditorJSWrapper.jsx
import React, { useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Image from '@editorjs/image';
import Table from '@editorjs/table';
import Quote from '@editorjs/quote';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';
import Embed from '@editorjs/embed';
import Underline from '@editorjs/underline';

/**
 * Enhanced EditorJS Wrapper Component
 * 
 * @param {Object} props
 * @param {Object} props.data - Initial data for the editor
 * @param {Function} props.onChange - Callback function when content changes
 * @param {string} props.holderId - ID for the editor container element
 * @param {number} props.minHeight - Minimum height for the editor (px)
 * @param {boolean} props.readOnly - Whether the editor is in read-only mode
 * @param {string} props.placeholder - Placeholder text when editor is empty
 * @param {Object} props.customTools - Additional custom tools to include
 * @param {Function} props.onReady - Callback when editor is ready
 */
const EditorJSWrapper = ({ 
  data = {}, 
  onChange, 
  holderId = 'editorjs',
  minHeight = 300,
  readOnly = false,
  placeholder = 'Bắt đầu viết hoặc chèn nội dung...',
  customTools = {},
  onReady,
  uploadImageCallback
}) => {
  const editorInstance = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Configure default tools
    const defaultTools = {
      header: {
        class: Header,
        config: {
          placeholder: 'Nhập tiêu đề',
          levels: [1, 2, 3, 4, 5, 6],
          defaultLevel: 2
        }
      },
      list: {
        class: List,
        inlineToolbar: true,
        config: {
          defaultStyle: 'unordered'
        }
      },
      image: {
        class: Image,
        config: {
          uploader: {
            uploadByFile: uploadImageCallback || ((file) => {
              return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  resolve({
                    success: 1,
                    file: {
                      url: e.target.result
                    }
                  });
                };
                reader.readAsDataURL(file);
              });
            })
          }
        }
      },
      table: Table,
      quote: Quote,
      marker: Marker,
      inlineCode: InlineCode,
      embed: {
        class: Embed,
        config: {
          services: {
            youtube: true,
            vimeo: true
          }
        }
      },
      underline: Underline
    };

    // Merge default tools with custom tools
    const mergedTools = { ...defaultTools, ...customTools };

    // Initialize editor only if it hasn't been initialized yet
    if (!isInitialized.current) {
      // Create new EditorJS instance
      editorInstance.current = new EditorJS({
        holder: holderId,
        autofocus: !readOnly,
        readOnly,
        placeholder,
        tools: mergedTools,
        data,
        minHeight,
        onChange: async () => {
          if (onChange) {
            const outputData = await editorInstance.current.save();
            onChange(outputData);
          }
        },
        onReady: () => {
          isInitialized.current = true;
          if (onReady) {
            onReady(editorInstance.current);
          }
        }
      });
    }

    // Cleanup on component unmount
    return () => {
      if (editorInstance.current && isInitialized.current) {
        try {
          editorInstance.current.isReady
            .then(() => {
              editorInstance.current.destroy();
              editorInstance.current = null;
              isInitialized.current = false;
            })
            .catch(e => console.error('Error destroying editor:', e));
        } catch (error) {
          console.error('Error cleaning up editor:', error);
        }
      }
    };
  }, [holderId, readOnly, placeholder, minHeight, onReady]);

  return (
    <div className="editor-wrapper">
      <div id={holderId} className="editor-container" style={{ minHeight }} />
    </div>
  );
};

export default EditorJSWrapper;
