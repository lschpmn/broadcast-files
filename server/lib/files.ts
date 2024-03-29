import ffmpeg from 'fluent-ffmpeg';
import { dirAsync } from 'fs-jetpack';
import { join } from 'path';

ffmpeg.setFfmpegPath(join(__dirname, '../..', 'bin', 'ffmpeg.exe'));
ffmpeg.setFfprobePath(join(__dirname, '../..', 'bin', 'ffprobe.exe'));

export const createThumbnail = async (path: string): Promise<string> => {
  const id = Math.random().toString(36).slice(-10);
  const imageDirPath = join(__dirname, '../..', 'public', 'images', id);
  await dirAsync(imageDirPath);

  return new Promise((res, rej) => {
    ffmpeg(path)
      .on('error', (err) => {
        console.log(err);
        rej(err);
      })
      .on('end', async () => {
        const imageFilePath = `/images/${id}/1.png`;
        res(imageFilePath);
      })
      .screenshots({
        filename: '1.png',
        folder: imageDirPath,
        size: '854x480',
        timemarks: ['10%'],
      });
  });
};
