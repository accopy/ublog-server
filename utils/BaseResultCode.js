/**
 * @code {number} 状态码
 * @desc {string} 说明
 */
class BaseResultCode {
  code;
  desc;

  constructor(code, desc) {
    this.code = code;
    this.desc = desc;
  }

  static SUCCESS = new BaseResultCode(200, '成功');
  static FAILED = new BaseResultCode(500, '失败');
  static VALIDATE_FAILED = new BaseResultCode(400, '参数校验失败');
  static API_NOT_FOUNT = new BaseResultCode(404, '接口不存在');
  static API_BUSY = new BaseResultCode(429, '操作过于频繁');
}

/**
 * @param code {number} 返回code
 * @param msg {string} 返回消息
 * @param data {any} 返回具体对象
 */
class Result {
  code;
  msg;
  data;
  time;

  constructor(code, msg, data) {
    this.code = code;
    this.msg = msg;
    this.data = data;
    this.time = Date.now();
  }

  /**
   * 成功
   * @param data {any} 返回对象
   * @return {Result}
   */
  static success(data) {
    return new Result(BaseResultCode.SUCCESS.code, BaseResultCode.SUCCESS.desc, data);
  }

  /**
   * 失败
   */
  static fail(errData) {
    return new Result(BaseResultCode.FAILED.code, BaseResultCode.FAILED.desc, errData);
  }

  /**
   * 参数校验失败
   */
  static validateFailed(param) {
    return new Result(
      BaseResultCode.VALIDATE_FAILED.code,
      BaseResultCode.VALIDATE_FAILED.desc,
      param,
    );
  }

  /**
   * 拦截到的业务异常
   * @param bizException {BizException} 业务异常
   */
  static bizFail(bizException) {
    return new Result(bizException.code, bizException.msg, null);
  }
}

module.exports = Result;
