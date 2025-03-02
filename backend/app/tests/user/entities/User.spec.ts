import { v4 as uuidV4 } from 'uuid';
import { CreateUserDTO } from '../../../domain/user/entities/User';
import UserFactory from '../../../domain/user/entities/UserFactory';

let userFactory: UserFactory;

describe('User Entity - unit tests', () => {
  beforeEach(() => {
    userFactory = new UserFactory();
  });

  it('Should NOT be able to create an user with invalid password', async () => {
    const userData: CreateUserDTO = {
      name: 'user-test',
      dateOfBirth: '1988-06-10',
      email: 'test@teste.com',
      gender: 'MALE',
      mainLanguage: 'portuguese',
      password: '123',
      yearsOfExperience: 20,
    };

    await expect(userFactory.create(userData)).rejects.toThrow(
      'Password must be at least 8 characters long',
    );

    await expect(
      userFactory.create({ ...userData, password: '12345678' }),
    ).rejects.toThrow('Password must contain at least one uppercase letter');

    await expect(
      userFactory.create({ ...userData, password: 'aaaaaaaa' }),
    ).rejects.toThrow('Password must contain at least one uppercase letter');

    await expect(
      userFactory.create({ ...userData, password: 'Aaaaaaaa' }),
    ).rejects.toThrow('Password must contain at least one number');

    await expect(
      userFactory.create({ ...userData, password: 'A1aaaaaa' }),
    ).rejects.toThrow('Password must contain at least one special character');
  });

  it('Should NOT be able to create an user with invalid date of birth', async () => {
    const userData: CreateUserDTO = {
      name: 'user-test',
      dateOfBirth: 'aaaaaa',
      email: 'test@teste.com',
      gender: 'MALE',
      mainLanguage: 'portuguese',
      password: 'Teste@123',
      yearsOfExperience: 20,
    };

    const error = 'Date of birth must be in the format YYYY-MM-DD';

    await expect(userFactory.create(userData)).rejects.toThrow(error);

    await expect(
      userFactory.create({ ...userData, dateOfBirth: 'aaaa-aa-aa' }),
    ).rejects.toThrow(error);

    await expect(
      userFactory.create({ ...userData, dateOfBirth: '1988-aa-aa' }),
    ).rejects.toThrow(error);

    await expect(
      userFactory.create({ ...userData, dateOfBirth: '1988-10-aa' }),
    ).rejects.toThrow(error);

    await expect(
      userFactory.create({ ...userData, dateOfBirth: '1988-10-0a' }),
    ).rejects.toThrow(error);
  });

  it('Should NOT be able to create an user with existing email', async () => {
    const userData: CreateUserDTO = {
      name: 'user-test',
      dateOfBirth: '1988-06-10',
      email: 'test@teste.com',
      gender: 'MALE',
      mainLanguage: 'portuguese',
      password: 'Teste@123',
      yearsOfExperience: 20,
    };

    await userFactory.create(userData);

    await expect(userFactory.create(userData)).rejects.toThrow(
      'This user aready exists',
    );
  });

  it('Should be able to create an user', async () => {
    const user = await userFactory.create({
      name: 'user-test2',
      dateOfBirth: '1988-06-10',
      email: 'test2@teste.com',
      gender: 'MALE',
      mainLanguage: 'portuguese',
      password: 'Teste@123',
      yearsOfExperience: 20,
    });
    expect(user.id).toBeDefined();
  });

  it('Should be able to return all users', async () => {
    await userFactory.create({
      name: 'user-test3',
      dateOfBirth: '1988-06-10',
      email: 'test3@teste.com',
      gender: 'MALE',
      mainLanguage: 'portuguese',
      password: 'Teste@123',
      yearsOfExperience: 20,
    });

    await userFactory.create({
      name: 'user-test4',
      dateOfBirth: '1988-06-10',
      email: 'test4@teste.com',
      gender: 'MALE',
      mainLanguage: 'portuguese',
      password: 'Teste@123',
      yearsOfExperience: 20,
    });

    const response = await userFactory.getAllUsers();
    expect(response.length).toBeGreaterThan(1);
  });

  it('Should be able get an user by id', async () => {
    const user = await userFactory.create({
      name: 'user-test5',
      dateOfBirth: '1988-06-10',
      email: 'test5@teste.com',
      gender: 'MALE',
      mainLanguage: 'portuguese',
      password: 'Teste@123',
      yearsOfExperience: 20,
    });

    const response = await userFactory.getUserById(user.id);
    expect(response?.id).toBe(user.id);
  });

  it('Should be able get an user by email', async () => {
    const user = await userFactory.create({
      name: 'user-test6',
      dateOfBirth: '1988-06-10',
      email: 'test6@teste.com',
      gender: 'MALE',
      mainLanguage: 'portuguese',
      password: 'Teste@123',
      yearsOfExperience: 20,
    });

    const response = await userFactory.getUserByEmail(user.email);
    expect(response?.email).toBe(user.email);
  });

  it('Should NOT be able to delete an user that does not exists', async () => {
    await expect(userFactory.delete(uuidV4())).rejects.toThrow(
      'User does not exist',
    );
  });

  it('Should be able to delete an user', async () => {
    const user = await userFactory.create({
      name: 'user-test7',
      dateOfBirth: '1988-06-10',
      email: 'test7@teste.com',
      gender: 'MALE',
      mainLanguage: 'portuguese',
      password: 'Teste@123',
      yearsOfExperience: 20,
    });

    const response = await userFactory.delete(user.id);
    const userExists = await userFactory.getUserById(user.id);

    expect(response).toBe(true);
    expect(userExists?.id).toBeUndefined();
  });

  it('Should NOT be able to delete an user that does not exists', async () => {
    await expect(userFactory.delete(uuidV4())).rejects.toThrow(
      'User does not exist',
    );
  });

  it('Should NOT be able to validate user with non-existing user', async () => {
    const isValidUserCredentials = await userFactory.isValidUserCredentials(
      'non-existing-email',
      '123',
    );

    expect(isValidUserCredentials).toBe(false);
  });

  it('Should NOT be able to validate with wrong credentials', async () => {
    const user = await userFactory.create({
      name: 'user-test8',
      dateOfBirth: '1988-06-10',
      email: 'test8@teste.com',
      gender: 'MALE',
      mainLanguage: 'portuguese',
      password: 'Teste@123',
      yearsOfExperience: 20,
    });

    const isValidUserCredentials = await userFactory.isValidUserCredentials(
      user.email,
      'wrong-password',
    );

    expect(isValidUserCredentials).toBe(false);
  });

  it('Should be able to validate credentials', async () => {
    const userFactory = new UserFactory();
    const user = await userFactory.create({
      name: 'user-test9',
      dateOfBirth: '1988-06-10',
      email: 'test9@teste.com',
      gender: 'MALE',
      mainLanguage: 'portuguese',
      password: 'Teste@123',
      yearsOfExperience: 20,
    });

    const isValidUserCredentials = await userFactory.isValidUserCredentials(
      user.email,
      'Teste@123',
    );

    expect(isValidUserCredentials).toBe(true);
  });
});
