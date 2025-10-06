from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="nova-universe-sdk",
    version="1.0.0",
    author="Nova Universe Team",
    author_email="api-support@nova-universe.com",
    description="Official Python SDK for Nova Universe Platform API",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/itristenx/nova-universe",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
    python_requires=">=3.8",
    install_requires=[
        "requests>=2.31.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "pytest-cov>=4.1.0",
            "black>=23.7.0",
            "mypy>=1.4.1",
            "types-requests>=2.31.0",
        ],
    },
    project_urls={
        "Documentation": "https://docs.nova-universe.com",
        "Source": "https://github.com/itristenx/nova-universe",
        "Bug Reports": "https://github.com/itristenx/nova-universe/issues",
    },
)
