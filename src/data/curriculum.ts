import mod01 from '../../docs/curriculum/01-enterprise-structure-and-master-data.md?raw';
import mod02 from '../../docs/curriculum/02-sap-fi-financial-accounting.md?raw';
import mod03 from '../../docs/curriculum/03-sap-mm-materials-management.md?raw';
import mod04 from '../../docs/curriculum/04-sap-ps-project-system.md?raw';
import mod05 from '../../docs/curriculum/05-integration-and-end-to-end-case-study.md?raw';
import mod06 from '../../docs/curriculum/06-tcode-spro-tables-and-exam-prep.md?raw';
import { parseCurriculum, buildStudyIndex, buildDictionaries, buildQuiz } from '../lib/study-engine';

export const modules = [
  parseCurriculum('01', '01-enterprise-structure-and-master-data.md', mod01),
  parseCurriculum('02', '02-sap-fi-financial-accounting.md', mod02),
  parseCurriculum('03', '03-sap-mm-materials-management.md', mod03),
  parseCurriculum('04', '04-sap-ps-project-system.md', mod04),
  parseCurriculum('05', '05-integration-and-end-to-end-case-study.md', mod05),
  parseCurriculum('06', '06-tcode-spro-tables-and-exam-prep.md', mod06),
];
export const studyIndex = buildStudyIndex(modules);
export const dictionaries = buildDictionaries(modules);
export const quiz = buildQuiz(modules);
