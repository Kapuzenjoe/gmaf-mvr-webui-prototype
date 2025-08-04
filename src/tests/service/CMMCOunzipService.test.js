import CMMCOunzipService from '../../service/CMMCOunzipService'
import JSZip from 'jszip';

jest.mock('jszip');

global.URL.createObjectURL = jest.fn(() => 'blob:http://fake-url');

describe('CMMCOunzipService', () => {
    test('should extract mp4 and csv from a ZIP file', async () => {

        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            blob: async () => new Blob(['fake zip content'], { type: 'application/zip' })
        });

        JSZip.loadAsync.mockResolvedValueOnce({
            files: {
                'video.mp4': {
                    name: 'video.mp4',
                    async: async () => new Blob(['video'], { type: 'video/mp4' }),
                },
                'pulse.csv': {
                    name: 'pulse.csv',
                    async: async () => new Blob(['csv'], { type: 'text/csv' }),
                },
                '__MACOSX/': {} // ignored
            },
            file: (name) => ({
                async async(type) {
                    return new Blob([name], { type: guessMimeType(name) });
                }
            }),
        });

        const mediaItems = await CMMCOunzipService.extractMediaItemsFromCMMCO('http://fake.zip');

        expect(mediaItems.length).toBe(2);
        expect(mediaItems.map(i => i.fileName)).toEqual(
            expect.arrayContaining(['video.mp4', 'pulse.csv'])
        );
    });
});
