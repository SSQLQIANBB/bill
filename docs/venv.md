# 这条命令是 **Windows 上激活 Python 虚拟环境** 的意思

```powershell
.\.venv\Scripts\activate
```

## 它做了什么？

1. 激活你项目里的 **`.venv`** 这个 Python 虚拟环境
2. 激活后，你安装的包 **只会存在这个项目里**，不会污染全局 Python
3. 命令行前面会出现 `(.venv)` 标记，代表成功

---

# ✔ 如果你 **报错 / 无法运行**

99% 是因为 **Windows 禁止运行脚本**，报错长这样：

```
无法加载文件 xxx\Scripts\activate.ps1，因为在此系统上禁止运行脚本
```

## 👉 **10 秒解决方法（必成功）**

以 **管理员身份** 打开 PowerShell，运行：

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

然后输入 **`Y`** 回车。

再回到你的项目里重新执行：

```powershell
.\.venv\Scripts\activate
```

就能成功了！

---

# ✔ 激活成功长这样

```
(.venv) PS D:\你的项目>
```

---

# ✔ 退出虚拟环境

```bash
deactivate
```

---

### 一句话总结

`.\.venv\Scripts\activate` = **激活项目的 Python 独立环境**
不能运行就按我上面那行命令开权限，**一次解决永久有效**！

需要我一步一步带你操作吗？
