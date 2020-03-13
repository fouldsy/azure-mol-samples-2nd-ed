#!/bin/bash

# This script sample is part of "Learn Azure in a Month of Lunches - 2nd edition" (Manning
# Publications) by Iain Foulds.
#
# This sample script covers the exercises from chapter 8 of the book. For more
# information and context to these commands, read a sample of the book and
# purchase at https://www.manning.com/books/learn-azure-in-a-month-of-lunches-second-edition
#
# This script sample is released under the MIT license. For more information,
# see https://github.com/fouldsy/azure-mol-samples-2nd-ed/blob/master/LICENSE

sudo apt update && sudo apt install -y nginx
git clone https://github.com/fouldsy/azure-mol-samples-2nd-edition.git
sudo cp azure-mol-samples-2nd-edition/08/webvm1/* /var/www/html/