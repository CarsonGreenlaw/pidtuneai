import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const weight = formData.get('weight') as string || '';
    const size = formData.get('size') as string || '';
    const style = formData.get('style') as string || 'freestyle';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tempFileName = `${uuidv4()}-${file.name}`;
    const tempFilePath = join(os.tmpdir(), tempFileName);

    await writeFile(tempFilePath, buffer);

    const scriptPath = join(process.cwd(), 'scripts', 'analyze_log.py');
    
    // Sanitize inputs to prevent shell injection or syntax errors
    const safeWeight = weight.replace(/"/g, '\\"');
    const safeSize = size.replace(/"/g, '\\"');
    const safeStyle = style.replace(/"/g, '\\"');

    try {
        const { stdout, stderr } = await execAsync(`python3 "${scriptPath}" "${tempFilePath}" "${safeWeight}" "${safeSize}" "${safeStyle}"`);
        
        // Clean up temp file
        await unlink(tempFilePath);

        try {
            const result = JSON.parse(stdout);
            return NextResponse.json(result);
        } catch (jsonError) {
            console.error("JSON Parse Error:", stdout);
            return NextResponse.json({ error: 'Failed to parse analysis results', details: stdout }, { status: 500 });
        }

    } catch (execError: any) {
        // Clean up temp file in case of error
        try { await unlink(tempFilePath); } catch {}
        
        console.error("Execution Error:", execError);
        return NextResponse.json({ error: 'Analysis failed', details: execError.message, stderr: execError.stderr }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
