import { readFile, writeFile, access } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdftk from 'node-pdftk';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 目标PDF文件路径
const ORIGINAL_PDF = path.join(__dirname, 'ID995A.pdf');
const DECRYPTED_PDF = path.join(__dirname, 'decrypted_ID995A.pdf');
const FILLED_PDF = path.join(__dirname, 'filled_ID995A.pdf');

async function main() {
  try {
    console.log('\n--- ID995A.pdf 填表程序 ---');
    
    // 检查解密文件是否存在，如果不存在则尝试解密
    if (!existsSync(DECRYPTED_PDF)) {
      console.log('解密后的PDF不存在，尝试解密...');
      
      try {
        // 首先验证原始PDF是否存在
        if (!existsSync(ORIGINAL_PDF)) {
          throw new Error(`原始PDF文件 ${ORIGINAL_PDF} 不存在`);
        }
        
        // 尝试检查qpdf是否已安装
        console.log('检查qpdf...');
        await execAsync('command -v qpdf');
        
        // 执行解密操作
        console.log('使用qpdf解密PDF...');
        await execAsync(`qpdf --decrypt "${ORIGINAL_PDF}" "${DECRYPTED_PDF}"`);
        console.log('✅ PDF解密成功!');
      } catch (decryptErr) {
        console.error('❌ 解密失败:', decryptErr.message);
        if (decryptErr.message.includes('command -v qpdf')) {
          console.error('qpdf未安装，请先安装qpdf工具：');
          console.error('  macOS: brew install qpdf');
          console.error('  Linux: apt-get install qpdf');
          console.error('  Windows: 下载安装 https://qpdf.sourceforge.io/');
        }
        console.error('或者手动解密PDF后重试:');
        console.error('  qpdf --decrypt ID995A.pdf decrypted_ID995A.pdf');
        return;
      }
    }
    
    // 准备要填充的数据
    const formData = {
      'engSurname': 'DOE',
      'engName': 'JOHN',
      'depEngSurname1': 'DOE',
      'depEngName1': 'JANE',
      'appDate': '31/12/2025'
    };
    
    console.log('\n准备填充的字段:');
    Object.entries(formData).forEach(([key, value]) => {
      console.log(`- ${key}: ${value}`);
    });
    
    // 使用node-pdftk库填充表单
    try {
      console.log('\n填充表单...');
      
      await pdftk
        .input(DECRYPTED_PDF)
        .fillForm(formData)
        .flatten()
        .output(FILLED_PDF);
      
      console.log(`\n✅ 已生成填充后的PDF: ${FILLED_PDF}`);
      console.log('\n您可以自定义index.js中的formData对象来填充不同的字段');
      console.log('查看所有可用字段: pdftk decrypted_ID995A.pdf dump_data_fields');
    } catch (fillErr) {
      console.error(`❌ 填充表单时出错: ${fillErr.message}`);
      console.log('尝试使用更简单的方法...');
      
      // 如果无法填充，简单地复制解密后的PDF
      const pdfBytes = await readFile(DECRYPTED_PDF);
      const outPath = path.join(__dirname, 'copy_ID995A.pdf');
      await writeFile(outPath, pdfBytes);
      console.log(`\n✅ 已创建PDF副本：${outPath}`);
    }
  } catch (err) {
    console.error('❌ 程序出错：', err.message);
  }
}

main();
