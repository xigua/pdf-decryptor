import { readFile, writeFile } from 'fs/promises';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 文件路径
const DECRYPTED_PDF = path.join(__dirname, 'decrypted_ID995A.pdf');
const OUTPUT_PDF = path.join(__dirname, 'pdf-lib-filled.pdf');

async function main() {
  try {
    console.log('\n--- 使用pdf-lib处理已解密的PDF ---');
    
    // 读取解密后的PDF文件
    console.log(`读取文件: ${DECRYPTED_PDF}`);
    const pdfBytes = await readFile(DECRYPTED_PDF);
    
    // 加载PDF文档
    console.log('加载PDF文档...');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // 获取表单
    console.log('获取表单...');
    const form = pdfDoc.getForm();
    
    // 输出所有表单字段名称
    console.log('\n表单字段列表:');
    const fields = form.getFields();
    console.log(`共找到 ${fields.length} 个字段`);
    
    // 按类型对字段进行分类统计
    const fieldTypes = {};
    fields.forEach(field => {
      const type = field.constructor.name;
      if (!fieldTypes[type]) {
        fieldTypes[type] = 0;
      }
      fieldTypes[type]++;
    });
    
    console.log('\n字段类型统计:');
    Object.entries(fieldTypes).forEach(([type, count]) => {
      console.log(`- ${type}: ${count}个`);
    });
    
    // 输出每个字段的类型和名称（限制为前20个，避免输出过多）
    console.log('\n字段示例（前20个）:');
    fields.slice(0, 20).forEach((field, index) => {
      const fieldName = field.getName();
      const fieldType = field.constructor.name;
      console.log(`${index + 1}. [${fieldType}] ${fieldName}`);
    });
    
    // 填充表单字段
    console.log('\n填充表单字段...');
    try {
      // 准备要填充的文本字段（只使用英文避免编码问题）
      const textFields = {
        'engSurname': 'DOE',
        'engName': 'JOHN',
        // 避免使用中文字段
        // 'chnName': '杜约翰',
        'maidSurname': '',
        'alias': '',
        'dobDay': '01',
        'dobMth': '01',
        'dobYr': '1980',
        'birthPlace': 'HONG KONG',
        'national': 'CHINA',
        'hkidAlpha': 'A',
        'hkidDigit': '123456',
        'hkidChkD': '7',
        'travelDocType': 'PASSPORT',
        'travelDocNo': 'P1234567',
        'depEngSurname1': 'DOE',
        'depEngName1': 'JANE',
        // 避免使用中文字段
        // 'depChnName1': '杜简',
        'appDate': '31/12/2025'
      };
      
      // 填充文本字段
      for (const [fieldName, value] of Object.entries(textFields)) {
        try {
          // 尝试找到字段并填充
          const field = form.getTextField(fieldName);
          if (field) {
            field.setText(value);
            console.log(`✓ 已填充文本字段 "${fieldName}" 为 "${value}"`);
          }
        } catch (fieldErr) {
          console.log(`✗ 无法填充文本字段 "${fieldName}": ${fieldErr.message}`);
        }
      }
      
      // 设置复选框（使用check/uncheck方法）
      console.log('\n设置复选框:');
      
      // 要检查的复选框
      const checkboxesToCheck = ['preReside'];
      // 要取消检查的复选框
      const checkboxesToUncheck = ['chgName', 'refEntry', 'refVisa'];
      
      // 设置选中的复选框
      for (const name of checkboxesToCheck) {
        try {
          const checkbox = form.getCheckBox(name);
          checkbox.check();
          console.log(`✓ 已选中复选框 "${name}"`);
        } catch (checkErr) {
          console.log(`✗ 无法选中复选框 "${name}": ${checkErr.message}`);
        }
      }
      
      // 设置未选中的复选框
      for (const name of checkboxesToUncheck) {
        try {
          const checkbox = form.getCheckBox(name);
          checkbox.uncheck();
          console.log(`✓ 已取消选中复选框 "${name}"`);
        } catch (uncheckErr) {
          console.log(`✗ 无法取消选中复选框 "${name}": ${uncheckErr.message}`);
        }
      }
      
      // 检查复选框的状态
      console.log('\n检查复选框状态:');
      for (const name of [...checkboxesToCheck, ...checkboxesToUncheck]) {
        try {
          const checkbox = form.getCheckBox(name);
          const isChecked = checkbox.isChecked();
          console.log(`- 复选框 "${name}" 的状态: ${isChecked ? '已选中' : '未选中'}`);
        } catch (stateErr) {
          console.log(`✗ 无法检查复选框 "${name}" 的状态: ${stateErr.message}`);
        }
      }
      
      // 不进行扁平化，避免编码问题
      console.log('\n跳过扁平化，避免编码问题...');
      
      // 保存PDF
      console.log('保存PDF...');
      const savedPdfBytes = await pdfDoc.save({
        updateFieldAppearances: true  // 更新字段外观，使复选框的变化可见
      });
      
      // 写入文件
      await writeFile(OUTPUT_PDF, savedPdfBytes);
      console.log(`\n✅ 已生成PDF: ${OUTPUT_PDF}`);
      
      // 输出比较结果
      console.log('\n比较结果:');
      console.log('1. pdf-lib 优点:');
      console.log('   - 能够处理英文字段填充');
      console.log('   - 可以设置一些基本的复选框');
      console.log('   - 纯JavaScript实现，无需外部依赖');
      console.log('2. node-pdftk 优点:');
      console.log('   - 更好地支持中文字段');
      console.log('   - 对复选框和单选按钮支持更完善');
      console.log('   - 能够处理更复杂的表单操作');
      console.log('3. 建议:');
      console.log('   - 如果只需要填充英文字段，两者都可以使用');
      console.log('   - 如果需要中文支持或更复杂的表单操作，推荐使用node-pdftk');
      console.log('   - 两者都需要先使用qpdf解密PDF文件');
      
    } catch (formErr) {
      console.error(`❌ 处理表单时出错: ${formErr.message}`);
    }
    
  } catch (err) {
    console.error('❌ 程序出错:', err.message);
    if (err.message.includes('not found')) {
      console.error(`请确认 ${DECRYPTED_PDF} 文件存在。`);
      console.error('您可以先运行 index.js 来生成解密的PDF文件。');
    }
  }
}

main(); 