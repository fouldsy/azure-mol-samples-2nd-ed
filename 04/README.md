When working in the Azure Cloud Shell, run the following commands to install the appropriate packages required by these samples. If you're running locally (not in the Azure Cloud Shell), make sure your system is using Python 3 by default, and pip3 by default. Check with `python --version` and `pip --version`:

```
pip install --user azurerm azure-cosmosdb-table azure-storage-queue==2.1.0
```

To then run each sample in the Azure Cloud Shell, such as:

```
python storage_table_demo.py
```
