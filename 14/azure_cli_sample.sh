#!/bin/bash

# This script sample is part of "Learn Azure in a Month of Lunches - 2nd edition" (Manning
# Publications) by Iain Foulds.
#
# This sample script covers the exercises from chapter 14 of the book. For more
# information and context to these commands, read a sample of the book and
# purchase at https://www.manning.com/books/learn-azure-in-a-month-of-lunches-second-edition
#
# This script sample is released under the MIT license. For more information,
# see https://github.com/fouldsy/azure-mol-samples-2nd-ed/blob/master/LICENSE

# Create a resource group
az group create --name azuremolchapter14 --location eastus

# Define a unique name for the Storage account
storageAccount=mystorageaccount$RANDOM

# Create an Azure Storage account
# Enable Blob services encryption, and only permit HTTPS traffic
az storage account create \
	--resource-group azuremolchapter14 \
	--name $storageAccount \
	--sku standard_lrs \
	--encryption-services blob \
	--https-only true

# Verify that the Storage account is configured encryption and HTTPS traffic
az storage account show \
    --name $storageAccount \
	--resource-group azuremolchapter14 \
	--query [enableHttpsTrafficOnly,encryption]

# Define a unique name for the Key Vault
keyVaultName=mykeyvault$RANDOM

# Create an Azure Key Vault
# Enable the vault for use with disk encryption
az keyvault create \
	--resource-group azuremolchapter14 \
	--name $keyVaultName \
	--enabled-for-disk-encryption

# Create a encryption key
# This key is stored in Key Vault and used to encrypt / decrypt VMs
# A basic software vault is used to store the key rather than premium Hardware Security Module (HSM) vault
# where all encrypt / decrypt operations are performed on the hardware device
az keyvault key create \
    --vault-name $keyVaultName \
    --name azuremolencryptionkey \
    --protection software

# Create a VM
az vm create \
    --resource-group azuremolchapter14 \
    --name molvm \
    --image ubuntults \
    --admin-username azuremol \
    --generate-ssh-keys

# Encrypt the VM created in the previous step
# The service principal, Key Vault, and encryption key created in the previous steps are used
az vm encryption enable \
    --resource-group azuremolchapter14 \
    --name molvm \
    --disk-encryption-keyvault $keyVaultName \
    --key-encryption-key azuremolencryptionkey

# Monitor the encryption status
# When the status reports as VMRestartPending, the VM must be restarted to finalize encryption
az vm encryption show \
    --resource-group azuremolchapter14 \
    --name molvm
