import { ApiBase } from '../api-base';
import { CreateStudent } from './create-student.type';
import { StudentBalance } from './student-balance.type';
import { Student } from './student.type';
import { UpdateStudent } from './update-student.type';

export abstract class StudentsApi implements ApiBase {
  public readonly baseUrl = '/students';

  protected abstract createStudent(data: CreateStudent): Promise<Student>;
  protected abstract getStudents(search?: string): Promise<Student[]>;
  protected abstract getStudent(id: string): Promise<Student>;
  protected abstract updateStudent(id: string, data: UpdateStudent): Promise<Student>;
  protected abstract getStudentBalance(id: string): Promise<StudentBalance>;
}
