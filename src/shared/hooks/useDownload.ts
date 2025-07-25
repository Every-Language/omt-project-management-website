import { useState, useCallback } from 'react';
import { downloadService } from '../services/downloadService';
import type { MediaFileWithVerseInfo } from './query/media-files';

export interface DownloadState {
  isDownloading: boolean;
  progress: number;
  error: string | null;
  downloadingFileId: string | null;
}

export const useDownload = () => {
  const [downloadState, setDownloadState] = useState<DownloadState>({
    isDownloading: false,
    progress: 0,
    error: null,
    downloadingFileId: null,
  });

  const downloadFile = useCallback(async (file: MediaFileWithVerseInfo) => {
    if (!file.remote_path) {
      setDownloadState(prev => ({
        ...prev,
        error: 'No remote file path available for download',
      }));
      return;
    }

    setDownloadState({
      isDownloading: true,
      progress: 0,
      error: null,
      downloadingFileId: file.id,
    });

    try {
      // Generate a meaningful filename if not available
      let filename = file.filename;
      if (!filename || filename === 'Unknown') {
        // Extract filename from remote path or create descriptive name
        if (file.remote_path) {
          filename = file.remote_path.split('/').pop() || `${file.verse_reference}.m4a`;
        } else {
          filename = `${file.verse_reference}.m4a`;
        }
      }

      // Ensure the filename has an extension
      if (!filename.includes('.')) {
        filename += '.m4a';
      }

      // Replace invalid filename characters
      filename = filename.replace(/[<>:"/\\|?*]/g, '_');

      await downloadService.downloadAudioFile(
        file.remote_path,
        filename,
        {
          onProgress: (progress) => {
            setDownloadState(prev => ({
              ...prev,
              progress,
            }));
          },
        }
      );

      // Success - clear state after a brief delay
      setDownloadState(prev => ({
        ...prev,
        progress: 100,
      }));

      setTimeout(() => {
        setDownloadState({
          isDownloading: false,
          progress: 0,
          error: null,
          downloadingFileId: null,
        });
      }, 1500);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      setDownloadState({
        isDownloading: false,
        progress: 0,
        error: errorMessage,
        downloadingFileId: null,
      });

      // Clear error after 8 seconds
      setTimeout(() => {
        setDownloadState(prev => ({
          ...prev,
          error: null,
        }));
      }, 8000);
    }
  }, []);

  const clearError = useCallback(() => {
    setDownloadState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    downloadState,
    downloadFile,
    clearError,
  };
}; 