import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import type { Message } from '@shared/types';
export const exportToText = (messages: Message[], sessionTitle: string) => {
  const content = messages
    .map((msg) => `### ${msg.role.toUpperCase()} (${new Date(msg.timestamp).toLocaleString()})\n\n${msg.content}\n`)
    .join('\n---\n\n');
  const blob = new Blob([`# ${sessionTitle}\n\n${content}`], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, `${sessionTitle.replace(/[^a-z0-9]/gi, '_')}.md`);
};
export const exportToImage = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.maxHeight = 'none';
          clonedElement.style.overflow = 'visible';
          clonedElement.style.padding = '40px';
        }
      }
    });
    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${filename.replace(/[^a-z0-9]/gi, '_')}.png`);
      }
    });
  } catch (error) {
    console.error('Failed to export image:', error);
    throw error;
  }
};