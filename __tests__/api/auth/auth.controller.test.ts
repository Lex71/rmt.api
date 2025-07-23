import { Request, Response } from "express";
// import request from "supertest";
// import app from "../../src/app"; // Assuming app.ts initializes Express
import { Types } from "mongoose";
import {
  loginUser,
  logoutUser,
  registerUser,
  whoami,
} from "../../../src/api/auth/auth.controller";
import Facility /*,  { IFacility } */ from "../../../src/models/facility";
import RefreshToken, { IRefreshToken } from "../../../src/models/refreshToken";
import User, { IUser } from "../../../src/models/user";
import { ApplicationError } from "../../../src/utils/errors";
import {
  comparePassword,
  issueAccessToken,
  issueRefreshToken,
} from "../../../src/utils/helpers";

jest.mock("../../../src/models/user");
jest.mock("../../../src/models/facility");
jest.mock("../../../src/models/refreshToken");
jest.mock("../../../src/utils/helpers");

const mockRequest = () => {
  return {
    user: {
      email: "test@example.com",
    },
  } as unknown as Request;
};

const mockRegistrationRequest = () => {
  return {
    body: {
      email: "test@example.com",
      facility: "123",
      name: "John Doe",
      password: "password",
      passwordConfirm: "password",
    },
  } as unknown as Request;
};

const mockLoginRequest = () => {
  return {
    body: {
      email: "test@example.com",
      password: "password",
    },
  } as unknown as Request;
};

const mockResponse = () => {
  return {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(), // chained
  } as unknown as Response;
};

const mockNext = () => jest.fn();

describe("registerUser method", () => {
  afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
  });
  it("should return error 400 if email is already in use", async () => {
    const req = mockRegistrationRequest();
    const res = mockResponse();
    const next = mockNext();
    const user: IUser = new User({
      email: "test@example.com",
    });
    (User.findOne as jest.Mock).mockResolvedValue(user);
    await registerUser(req, res, next);
    expect(next).toHaveBeenCalledWith(
      new ApplicationError(
        400,
        "An user with that email is already registered",
      ),
    );
  });

  it("should return 400 if facility invalid", async () => {
    const req = mockRegistrationRequest();
    const res = mockResponse();
    const next = mockNext();

    const user: IUser = new User({
      email: "test@example.com",
      facility: "123", // invalid ObjectId
      name: "John Doe",
      password: "password",
    });

    (User.findOne as jest.Mock).mockResolvedValue(null);
    (User.create as jest.Mock).mockResolvedValue(user);
    (Facility.exists as jest.Mock).mockRejectedValue(
      new ApplicationError(400, "Not Valid Facility ObjectId"),
    );
    // jest.spyOn(User, "create").mockReturnValueOnce(Promise.resolve(user));
    // User.create = jest.fn().mockImplementation(() => Promise.resolve(user));

    await registerUser(req, res, next);
    expect(next).toHaveBeenCalledWith(
      new ApplicationError(400, "Not Valid Facility ObjectId"),
    );
  });

  it("should return 400 if facility does not exist", async () => {
    const req = mockRegistrationRequest();
    const res = mockResponse();
    const next = mockNext();

    const user: IUser = new User({
      email: "test@example.com",
      facility: "6841a1552bffd75c87efe4fx", // valid ObjectId but does not exist
      name: "John Doe",
      password: "password",
    });

    (User.findOne as jest.Mock).mockResolvedValue(null);
    (User.create as jest.Mock).mockResolvedValue(user);
    (Facility.exists as jest.Mock).mockResolvedValue(false);
    // jest.spyOn(User, "create").mockReturnValueOnce(Promise.resolve(user));
    // User.create = jest.fn().mockImplementation(() => Promise.resolve(user));

    await registerUser(req, res, next);
    expect(next).toHaveBeenCalledWith(
      new ApplicationError(400, "Facility does not exist"),
    );
  });

  it("should return 400 if password and confirmPassword do not match", async () => {
    const req = mockRegistrationRequest();
    const res = mockResponse();
    const next = mockNext();

    const user: IUser = new User({
      email: "test@example.com",
      facility: "6841a1552bffd75c87efe4fx", // valid ObjectId but does not exist
      name: "John Doe",
      password: "password",
    });

    (req.body as Partial<IUser> & { passwordConfirm: string }).passwordConfirm =
      "wrongPassword";

    (User.findOne as jest.Mock).mockResolvedValue(null);
    (User.create as jest.Mock).mockResolvedValue(user);
    (Facility.exists as jest.Mock).mockResolvedValue(true);
    // jest.spyOn(User, "create").mockReturnValueOnce(Promise.resolve(user));
    // User.create = jest.fn().mockImplementation(() => Promise.resolve(user));

    await registerUser(req, res, next);
    expect(next).toHaveBeenCalledWith(
      new ApplicationError(400, "Passwords do not match"),
    );
  });

  it("should return 201 and user if successful", async () => {
    const req = mockRegistrationRequest();
    const res = mockResponse();
    const next = mockNext();

    const user: IUser = new User({
      email: "test@example.com",
      facility: "123",
      name: "John Doe",
      password: "password",
      role: "user",
    });

    // const facilty: IFacility = new Facility({
    //   address: "address 1",
    //   name: "name 1",
    // });

    (User.findOne as jest.Mock).mockResolvedValue(null);
    (User.create as jest.Mock).mockResolvedValue(user);
    (Facility.exists as jest.Mock).mockResolvedValue(true);
    // jest.spyOn(User, "create").mockReturnValueOnce(Promise.resolve(user));
    // User.create = jest.fn().mockImplementation(() => Promise.resolve(user));

    await registerUser(req, res, next);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ data: { user } });
  });
});

describe("loginUser method", () => {
  afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
  });
  it("should return error 401 if email is missing", async () => {
    const req = mockLoginRequest();
    delete (req.body as Partial<IUser>).email;
    const res = mockResponse();
    const next = mockNext();
    await loginUser(req, res, next);
    expect(next).toHaveBeenCalledWith(
      new ApplicationError(401, "Missing Email"),
    );
  });

  it("should return error 401 if password is missing", async () => {
    const req = mockLoginRequest();
    delete (req.body as Partial<IUser>).password;
    const res = mockResponse();
    const next = mockNext();
    await loginUser(req, res, next);
    expect(next).toHaveBeenCalledWith(
      new ApplicationError(401, "Missing Password"),
    );
  });

  it("should return error 401 if user is not found", async () => {
    const req = mockLoginRequest();
    const res = mockResponse();
    const next = mockNext();
    (User.findOne as jest.Mock).mockResolvedValue(null);
    await loginUser(req, res, next);
    expect(next).toHaveBeenCalledWith(
      new ApplicationError(401, "Invalid email"),
    );
  });

  it("should return error 401 if password is incorrect", async () => {
    const req = mockLoginRequest();
    const res = mockResponse();
    const next = mockNext();
    const user = new User(req.body);
    (User.findOne as jest.Mock).mockResolvedValue(user);
    (comparePassword as jest.Mock).mockResolvedValue(false);
    await loginUser(req, res, next);
    expect(next).toHaveBeenCalledWith(
      new ApplicationError(401, "Invalid Password"),
    );
  });

  it("should return 200 and User.toJSON() if successful", async () => {
    const req = mockLoginRequest();
    const res = mockResponse();
    const next = mockNext();
    const facilityId: Types.ObjectId = new Types.ObjectId();
    const userId: Types.ObjectId = new Types.ObjectId();
    const user = {
      ...req.body,
      _id: userId,
      facility: { _id: facilityId },
      role: "role",
    } as Partial<IUser>;
    // const userToJSON: IUser = new User(user).toJSON();
    (User.findOne as jest.Mock).mockResolvedValue(user);
    (comparePassword as jest.Mock).mockResolvedValue(true);
    (issueAccessToken as jest.Mock).mockReturnValue("accessToken");
    (issueRefreshToken as jest.Mock).mockReturnValue("refreshToken");
    const rT: IRefreshToken = new RefreshToken({
      token: "refreshToken",
      user: userId,
    });
    (RefreshToken.create as jest.Mock).mockResolvedValue(rT);
    res.cookie = jest.fn();

    await loginUser(req, res, next);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
        user,
      },
    });
  });
});

describe("whoami method", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 and the user if logged in", async () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();
    const user: IUser = new User({ email: "test@example.com" });

    (User.findOne as jest.Mock).mockResolvedValueOnce(user);

    await whoami(req, res, next);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: { user } });
  });

  it("should return 401 Unauthorized if user is not logged in", async () => {
    const req = mockRequest();
    req.user = undefined;
    const res = mockResponse();
    const next = mockNext();

    await whoami(req, res, next);

    // expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next).toHaveBeenCalledWith(
      new ApplicationError(401, "Unauthorized"),
    );
  });
});

describe("logoutUser method", () => {
  it("should return 200 and user if successful", () => {
    const req = mockRequest();
    const res = mockResponse();

    res.clearCookie = jest.fn();

    logoutUser(req, res);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: req.user,
    });
  });
});
