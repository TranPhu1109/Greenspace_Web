// src/components/common/MarkdownEditor.jsx
import React from 'react';
import TurndownService from 'turndown';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';

const mdParser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  quotes: '""\'\'',
});

// Cấu hình Turndown để xử lý tốt nội dung từ Word
const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  hr: '---',
  strongDelimiter: '**',
  emDelimiter: '*',
  linkStyle: 'inlined',
  linkReferenceStyle: 'full',
});

// Xử lý đoạn văn bản
turndownService.addRule('paragraph', {
  filter: 'p',
  replacement: function (content, node) {
    // Loại bỏ các khoảng trắng dư thừa từ Word
    const cleanedContent = content.replace(/\s+/g, ' ').trim();
    return cleanedContent ? `\n\n${cleanedContent}\n\n` : '\n\n';
  }
});

// Định dạng in đậm
turndownService.addRule('bold', {
  filter: ['strong', 'b', 'span[style*="font-weight: bold"]', 'span[style*="font-weight:bold"]'],
  replacement: function (content) {
    if (!content.trim()) return '';
    return `**${content.trim()}**`;
  }
});

// Định dạng nghiêng
turndownService.addRule('italic', {
  filter: ['em', 'i', 'span[style*="font-style: italic"]', 'span[style*="font-style:italic"]'],
  replacement: function (content) {
    if (!content.trim()) return '';
    return `*${content.trim()}*`;
  }
});

// Xử lý các tiêu đề
turndownService.addRule('heading', {
  filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  replacement: function (content, node) {
    const level = Number(node.nodeName.charAt(1));
    const cleanedContent = content.trim();
    if (!cleanedContent) return '';
    return `\n\n${'#'.repeat(level)} ${cleanedContent}\n\n`;
  }
});

// Xử lý danh sách có thứ tự (1. 2. 3.)
turndownService.addRule('orderedList', {
  filter: 'ol',
  replacement: function (content, node) {
    let result = '\n\n';
    
    // Xử lý lồng danh sách
    const listItems = Array.from(node.querySelectorAll('li'));
    listItems.forEach((item, index) => {
      // Lấy nội dung và loại bỏ các phần tử con đã được xử lý
      const itemContent = turndownService.turndown(item.innerHTML);
      
      // Kiểm tra nếu có danh sách con
      const hasSublist = item.querySelector('ol, ul');
      
      if (itemContent.trim()) {
        result += `${index + 1}. ${itemContent.trim()}${hasSublist ? '' : '\n'}`;
      }
    });
    
    return result + '\n\n';
  }
});

// Xử lý danh sách không có thứ tự (•, *, -)
turndownService.addRule('unorderedList', {
  filter: 'ul',
  replacement: function (content, node) {
    let result = '\n\n';
    
    // Xử lý lồng danh sách
    const listItems = Array.from(node.querySelectorAll('li'));
    listItems.forEach(item => {
      // Lấy nội dung và loại bỏ các phần tử con đã được xử lý
      const itemContent = turndownService.turndown(item.innerHTML);
      
      // Kiểm tra nếu có danh sách con
      const hasSublist = item.querySelector('ol, ul');
      
      if (itemContent.trim()) {
        result += `- ${itemContent.trim()}${hasSublist ? '' : '\n'}`;
      }
    });
    
    return result + '\n\n';
  }
});

// Xử lý bảng
turndownService.addRule('table', {
  filter: 'table',
  replacement: function (content, node) {
    const rows = Array.from(node.querySelectorAll('tr'));
    let result = '\n\n';
    
    // Xử lý header nếu có
    const headerRow = rows.shift();
    if (headerRow) {
      const headers = Array.from(headerRow.querySelectorAll('th,td')).map(cell => 
        cell.textContent.trim().replace(/\|/g, '\\|') || ' '
      );
      
      if (headers.length) {
        result += `| ${headers.join(' | ')} |\n`;
        result += `| ${headers.map(() => '---').join(' | ')} |\n`;
      }
    }
    
    // Xử lý các hàng dữ liệu
    rows.forEach(row => {
      const cells = Array.from(row.querySelectorAll('td')).map(cell => 
        cell.textContent.trim().replace(/\|/g, '\\|') || ' '
      );
      
      if (cells.length) {
        result += `| ${cells.join(' | ')} |\n`;
      }
    });
    
    return result + '\n';
  }
});

// Xử lý đường kẻ ngang
turndownService.addRule('horizontalRule', {
  filter: 'hr',
  replacement: function () {
    return '\n\n---\n\n';
  }
});

// Xử lý các đoạn có đánh số trực tiếp trong Word (1., 2., a., b.)
turndownService.addRule('numberedLines', {
  filter: function (node) {
    return (
      node.nodeName === 'P' &&
      /^[\d]+[\.\)][\s]+.+/.test(node.textContent.trim())
    );
  },
  replacement: function (content) {
    const text = content.trim();
    return `\n\n${text}\n\n`;
  }
});

// Xử lý dấu ngắt dòng
turndownService.addRule('lineBreak', {
  filter: 'br',
  replacement: function () {
    return '\n';
  }
});

// Xử lý các nội dung có dấu gạch ngang
turndownService.addRule('strikethrough', {
  filter: ['s', 'strike', 'del', 'span[style*="text-decoration: line-through"]'],
  replacement: function (content) {
    return `~~${content}~~`;
  }
});

// Xử lý link
turndownService.addRule('link', {
  filter: function (node) {
    return node.nodeName === 'A' && node.getAttribute('href');
  },
  replacement: function (content, node) {
    const href = node.getAttribute('href');
    const title = node.title ? ` "${node.title}"` : '';
    return `[${content}](${href}${title})`;
  }
});

// Xử lý định dạng đặc biệt từ Word (span với các style đặc biệt)
turndownService.addRule('wordSpecificStyles', {
  filter: function (node) {
    return (
      node.nodeName === 'SPAN' && 
      node.getAttribute('style') && 
      node.getAttribute('style').includes('mso-')
    );
  },
  replacement: function (content) {
    return content;
  }
});

const MarkdownEditor = ({ value, onChange, height = 400, placeholder = 'Nhập nội dung tại đây...' }) => {
  const handleEditorChange = ({ text }) => {
    onChange?.(text);
  };

  const cleanWordHtml = (html) => {
    // Loại bỏ các thẻ và thuộc tính đặc biệt của Word
    let cleaned = html;
    
    // Loại bỏ các style của Word
    cleaned = cleaned.replace(/<style>[\s\S]*?<\/style>/gi, '');
    
    // Loại bỏ các thẻ xml và các thuộc tính xmlns
    cleaned = cleaned.replace(/<xml>[\s\S]*?<\/xml>/gi, '');
    cleaned = cleaned.replace(/<!\[if[\s\S]*?<!\[endif\]>/gi, '');
    cleaned = cleaned.replace(/xmlns:o="urn:schemas-microsoft-com:office:office"/g, '');
    cleaned = cleaned.replace(/xmlns:w="urn:schemas-microsoft-com:office:word"/g, '');
    
    // Loại bỏ các thuộc tính class và style không cần thiết
    cleaned = cleaned.replace(/class="MsoNormal"/g, '');
    cleaned = cleaned.replace(/style="mso-[^"]*"/g, '');
    
    // Xử lý các khoảng trắng dư thừa
    cleaned = cleaned.replace(/&nbsp;/g, ' ');
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    return cleaned;
  };

  const handlePaste = (event) => {
    const clipboardData = event.clipboardData || window.clipboardData;
    const html = clipboardData.getData('text/html');
    
    if (html) {
      event.preventDefault();
      
      // Làm sạch HTML từ Word trước khi chuyển đổi
      const cleanedHtml = cleanWordHtml(html);
      const markdown = turndownService.turndown(cleanedHtml);
      
      // Chèn vào vị trí con trỏ hiện tại
      const textarea = event.target;
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      
      const newValue = value.slice(0, start) + markdown + value.slice(end);
      onChange?.(newValue);
    }
  };

  return (
    <MdEditor
      value={value}
      style={{ height }}
      placeholder={placeholder}
      renderHTML={(text) => mdParser.render(text)}
      onChange={handleEditorChange}
      onPaste={handlePaste}
      config={{
        view: { md: true, html: true, menu: true },
        canView: { md: true, html: true, menu: true, fullScreen: true },
        markdownClass: 'markdown-body',
        htmlClass: 'custom-html-style'
      }}
    />
  );
};

export default MarkdownEditor;
