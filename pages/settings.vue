<template>
  <div v-if="!loading.startedLoading" id="settings-page" class="flex">
    <el-menu id="settings-sidebar">
      <div id="sidebar-wrapper">
        <h1 class="text-base pb-4">{{$t('title.Settings')}}</h1>
        <label class="block text-xs opacity-60 mb-1">{{$t('title.General')}}</label>
        <el-menu-item class="sidebar-item" :class="{active: tab === 'account'}" index="1" @click="tab = 'account'">
          <Icon name="mingcute:user-setting-fill" /> <span>{{$t('title.Account')}}</span>
        </el-menu-item>
        <el-menu-item class="sidebar-item" :class="{active: tab === 'preference'}" index="2" @click="tab = 'preference'">
          <Icon name="oui:controls-horizontal" /> <span>{{$t('title.Preference')}}</span>
        </el-menu-item>
        <el-menu-item class="sidebar-item" :class="{active: tab === 'api'}" index="6" @click="tab = 'api'">
          <Icon name="mdi:api" /> <span>{{$t('title.API')}}</span>
        </el-menu-item>

        <div v-if="storeId">
          <div v-if="isBossAccount">
            <label class="block text-xs opacity-60 mb-1">{{$t('title.Inventory')}}</label>
            <el-menu-item class="sidebar-item" :class="{active: tab === 'columns'}" index="3" @click="tab = 'columns'">
              <Icon name="fluent:database-plug-connected-20-filled" /> <span>{{$t('title.Columns')}}</span>
            </el-menu-item>
          </div>
  
          <label class="block text-xs opacity-60 mb-1">{{$t('title.Cashier')}}</label>
          <el-menu-item class="sidebar-item" :class="{active: tab === 'receipt'}" index="4" @click="tab = 'receipt'">
            <Icon name="tabler:receipt-filled" /> <span>{{$t('title.Receipt')}}</span>
          </el-menu-item>

          <div v-if="isBossAccount">
            <el-menu-item class="sidebar-item" :class="{active: tab === 'invoice'}" index="5" @click="tab = 'invoice'">
              <Icon name="fa6-solid:file-invoice" /> <span>{{$t('title.Invoice')}}</span>
            </el-menu-item>
          </div>
        </div>
      </div>
    </el-menu>
    
    <div id="settings-wrapper" class="flex justify-center w-full pl-[180px]">
      <div v-if="tab === 'account'" class="tab">
        <div class="pt-8 pb-4">
          <h1 class="text-xl text-white">{{$t('title.Account')}}</h1>
          <p v-if="!isBossAccount" class="text-sm mb-2 opacity-85">{{$t('text.Only a manager can edit account details')}}</p>
        </div>

        <el-form ref="userForm" class="flex flex-col gap-3 px-6" :model="form" :rules="userRules" label-position="top">
          <label class="block text-base font-bold mb-1">{{$t('title.General')}}</label>

          <el-form-item :label="$t('label.username')" prop="username">
            <el-tooltip v-if="!isBossAccount" :content="$t(`text.Contact your manager to update your account details`)" placement="top">
              <el-input v-model="form.username" :value="form.username" autocomplete="off" disabled />
            </el-tooltip>
            <el-input v-else v-model="form.username" :value="form.username" autocomplete="off" />
          </el-form-item>

          <el-form-item :label="$t('label.name')" prop="name">
            <el-tooltip v-if="!isBossAccount" :content="$t(`text.Contact your manager to update your account details`)" placement="top">
              <el-input v-model="form.name" :value="form.name" autocomplete="off" disabled />
            </el-tooltip>
            <el-input v-else v-model="form.name" :value="form.name" autocomplete="off" />
          </el-form-item>

          <el-form-item :label="$t('label.email')" prop="email">
            <el-tooltip v-if="!isBossAccount" :content="$t(`text.Contact your manager to update your account details`)" placement="top">
              <el-input v-model="form.email" :value="form.email" autocomplete="off" disabled />
            </el-tooltip>
            <el-input v-else v-model="form.email" :value="form.email" autocomplete="off" />
          </el-form-item>
          
          <div v-if="isBossAccount" class="py-2">
            <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
              <el-button class="!block ml-auto" type="success" plain disabled>{{$t('label.Save')}}</el-button>
            </el-tooltip>
            <el-button v-else class="!block ml-auto" plain type="success" :disabled="!form.username || !form.name || !form.email" :loading="loading.saveUser" @click="saveUser">{{$t('label.Save')}}</el-button>
          </div>
        </el-form>

        <el-form ref="passwordForm" class="flex flex-col gap-3 pt-2 px-6" :model="form" :rules="passwordRules" label-position="top">
          <label class="flex items-center justify-between text-base font-bold mb-1">
            <span>{{$t('label.Update Password')}}</span>
            <div v-if="isBossAccount" class="cursor-pointer px-3 py-2 opacity-60 transition-all rounded-md hover:opacity-90" @click="form.seePassword = !form.seePassword">
              <Icon class="text-xl" :name="form.seePassword ? 'tabler:eye-off' : 'tabler:eye'" />
            </div>
          </label>


          <el-form-item :label="$t('label.New Password')" prop="password1">
            <el-tooltip v-if="!isBossAccount" :content="$t(`text.Contact your manager to update your password`)" placement="top">
              <el-input v-model="form.password1" :value="form.password1" :type="form.seePassword ? '' : 'password'" autocomplete="off" disabled />
            </el-tooltip>
            <el-input v-else v-model="form.password1" :value="form.password1" :type="form.seePassword ? '' : 'password'" autocomplete="off" />
          </el-form-item>

          <el-form-item :label="$t('label.Confirm Password')" prop="password2">
            <el-tooltip v-if="!isBossAccount" :content="$t(`text.Contact your manager to update your password`)" placement="top">
              <el-input v-model="form.password2" :value="form.password2" :type="form.seePassword ? '' : 'password'" autocomplete="off" disabled />
            </el-tooltip>
            <el-input v-else v-model="form.password2" :value="form.password2" :type="form.seePassword ? '' : 'password'" autocomplete="off" />
          </el-form-item>
          <div v-if="isBossAccount" class="py-2">
            <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
              <el-button class="!block ml-auto" type="success" plain disabled>{{$t('label.Update')}}</el-button>
            </el-tooltip>
            <el-button v-else class="!block ml-auto" plain type="success" :disabled="form.password1.length < 6 || form.password2.length < 6" :loading="loading.updatePassword" @click="updatePassword">{{$t('label.Update')}}</el-button>
          </div>
        </el-form>
      </div>

      <div v-if="tab === 'preference'" class="tab">
        <div class="pt-8 pb-4">
          <h1 class="text-xl text-white">{{$t('title.Preference')}}</h1>

          <div class="px-6 py-4">
            <div>
              <label class="block text-base font-bold mb-2">{{$t('title.Language')}}</label>
              <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
                <el-select v-model="form.language" :placeholder="$t('title.Language')" disabled>
                  <el-option :label="$t('label.English')" value="en" />
                  <el-option :label="$t('label.Spanish')" value="es" />
                </el-select>
              </el-tooltip>
              <el-select v-else v-model="form.language" :placeholder="$t('title.Language')" @change="saveUserSettings">
                <el-option :label="$t('label.English')" value="en" />
                <el-option :label="$t('label.Spanish')" value="es" />
              </el-select>
            </div>
          </div>
        </div>
      </div>

      <div v-if="tab === 'api'" class="tab">
        <div class="pt-8 pb-4">
          <h1 class="text-xl text-white">{{$t('title.API')}}</h1>
          <p class="text-sm mb-2 opacity-85">{{$t('text.Use this key to access your data from external apps')}}</p>
          <NuxtLink to="/docs" class="text-sm text-blue-400 hover:text-blue-300 underline">{{$t('label.Go to Docs')}}</NuxtLink>

          <div class="px-6 py-4">
            <div>
              <label class="block text-base font-bold mb-2">{{$t('title.API Key')}}</label>
              <div v-if="user.api_key" class="flex items-center gap-2">
                <el-input v-model="user.api_key" :type="form.showApiKey ? '' : 'password'" readonly class="font-mono" />
                <el-button class="!h-[42px]" @click="form.showApiKey = !form.showApiKey">
                  <Icon class="text-base" :name="form.showApiKey ? 'tabler:eye-off' : 'tabler:eye'" />
                </el-button>
                <el-button class="!ml-0 !h-[42px]" @click="copyApiKey">
                  <Icon class="text-base" name="material-symbols:content-copy" />
                </el-button>
              </div>
              <p v-else class="text-sm opacity-60 italic">{{$t('text.No API key generated yet')}}</p>
              <div class="flex gap-2 mt-4">
                <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
                  <el-button type="primary" disabled>{{ user.api_key ? $t('label.Regenerate') : $t('label.Generate') }}</el-button>
                </el-tooltip>
                <el-button v-else class="ml-auto" type="primary" :loading="loading.regenerateKey" @click="regenerateApiKey">
                  {{ user.api_key ? $t('label.Regenerate') : $t('label.Generate') }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="storeId && tab === 'columns'" class="tab">
        <div class="pt-8 pb-4">
          <h1 class="text-xl text-white">{{$t('title.Columns')}}</h1>

          <div class="flex flex-col gap-3 px-6 py-4">
            <div>
              <label class="block text-base font-bold mb-1">{{$t('label.Name')}}</label>
              <p class="text-sm mb-2 opacity-85">{{$t('text.Which column contains the name of the product?')}}</p>
              <el-select v-model="columnForm.name" :placeholder="$t(`label.Select`)" size="large">
                <div :key="column" v-for="column in store?.inventory.columns.filter(item => 
                  (!columnForm.price || !item.includes(columnForm.price)) && 
                  (!columnForm.quantity || !item.includes(columnForm.quantity)) &&
                  (!columnForm.discount || !item.includes(columnForm.discount)) &&
                  (!columnForm.cost || !item.includes(columnForm.cost)))"
                >
                  <el-option :label="column" :value="column" />
                </div>
              </el-select>
              <div class="flex justify-between flex-wrap px-1 text-sm text-right opacity-85">
                <span>({{$t('label.Type')}}: {{$t('label.String')}})</span>
              </div>
            </div>

            <div>
              <label class="block text-base font-bold mb-1">{{$t('label.Price')}}</label>
              <p class="text-sm mb-2 opacity-85">{{$t('text.Which column lists the product price?')}}</p>
              <el-select v-model="columnForm.price" :placeholder="$t(`label.Select`)" size="large">
                <div :key="column" v-for="column in store?.inventory.columns.filter(item => 
                  (!columnForm.name || !item.includes(columnForm.name)) && 
                  (!columnForm.quantity || !item.includes(columnForm.quantity)) &&
                  (!columnForm.discount || !item.includes(columnForm.discount)) &&
                  (!columnForm.cost || !item.includes(columnForm.cost)))"
                >
                  <el-option :label="column" :value="column" />
                </div>
              </el-select>
              <div class="flex justify-between flex-wrap px-1 text-sm text-right opacity-85">
                <span>({{$t('label.Type')}}: {{$t('label.Float')}})</span>
                <span>({{$t('label.Default value')}}: 0.00)</span>
              </div>
            </div>

            <div>
              <label class="block text-base font-bold mb-1">{{$t('label.Quantity')}}</label>
              <p class="text-sm mb-2 opacity-85">{{$t('text.Which column lists the product quantity?')}}</p>
              <el-select v-model="columnForm.quantity" :placeholder="$t(`label.Select`)" size="large">
                <div :key="column" v-for="column in store?.inventory.columns.filter(item => 
                  (!columnForm.name || !item.includes(columnForm.name)) && 
                  (!columnForm.price || !item.includes(columnForm.price)) &&
                  (!columnForm.discount || !item.includes(columnForm.discount)) &&
                  (!columnForm.cost || !item.includes(columnForm.cost)))"
                >
                  <el-option :label="column" :value="column" />
                </div>
              </el-select>
              <div class="flex justify-between flex-wrap px-1 text-sm text-right opacity-85">
                <span>({{$t('label.Type')}}: {{$t('label.Whole Number')}})</span>
                <span>({{$t('label.Default value')}}: 0)</span>
              </div>
            </div>

            <div>
              <label class="block text-base font-bold mb-1">{{$t('label.Discount')}}</label>
              <p class="text-sm mb-2 opacity-85">{{$t('text.Which column lists the product discount?')}}</p>
              <el-select v-model="columnForm.discount" :placeholder="$t(`label.Select`)" size="large">
                <div :key="column" v-for="column in store?.inventory.columns.filter(item => 
                  (!columnForm.name || !item.includes(columnForm.name)) && 
                  (!columnForm.price || !item.includes(columnForm.price)) &&
                  (!columnForm.quantity || !item.includes(columnForm.quantity)) &&
                  (!columnForm.cost || !item.includes(columnForm.cost)))"
                >
                  <el-option :label="column" :value="column" />
                </div>
              </el-select>
              <div class="flex justify-between flex-wrap px-1 text-sm text-right opacity-85">
                <span>({{$t('label.Type')}}: {{$t('label.Whole Number')}})</span>
                <span>({{$t('label.Default value')}}: 0%)</span>
              </div>
            </div>

            <div>
              <label class="block text-base font-bold mb-1">{{$t('label.Cost')}}</label>
              <p class="text-sm mb-2 opacity-85">{{$t('text.Which column lists the product cost?')}}</p>
              <el-select v-model="columnForm.cost" :placeholder="$t(`label.Select`)" size="large">
                <div :key="column" v-for="column in store?.inventory.columns.filter(item => 
                  (!columnForm.name || !item.includes(columnForm.name)) && 
                  (!columnForm.price || !item.includes(columnForm.price)) &&
                  (!columnForm.quantity || !item.includes(columnForm.quantity)) && 
                  (!columnForm.discount || !item.includes(columnForm.discount)))"
                >
                  <el-option :label="column" :value="column" />
                </div>
              </el-select>
              <div class="flex justify-between flex-wrap px-1 text-sm text-right opacity-85">
                <span>({{$t('label.Type')}}: {{$t('label.Float')}})</span>
                <span>({{$t('label.Default value')}}: 0.00)</span>
              </div>
            </div>
          </div>

          <div v-if="isBossAccount" class="px-6 py-3">
            <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
              <el-button class="!block ml-auto" type="success" plain disabled>{{$t('label.Save')}}</el-button>
            </el-tooltip>
            <el-button v-else class="!block ml-auto" type="success" :loading="loading.linkColumns" plain @click="linkColumns">{{$t('label.Save')}}</el-button>
          </div>
        </div>
      </div>

      <div v-if="storeId && tab === 'receipt'" class="tab">
        <div class="pt-8 pb-4">
          <h1 class="text-xl text-white">{{$t('title.Cashier')}}</h1>

          <div v-if="isBossAccount" class="flex flex-col gap-3 px-6 py-4">
            <div>
              <label class="block text-base font-bold mb-2">{{$t('label.Tax')}}</label>
              <el-input-number v-model="cashierForm.tax" :precision="2" :step="0.1" :max="100">
                <template #suffix>
                  <span>%</span>
                </template>
              </el-input-number>
            </div>
          </div>

          <h1 class="text-xl text-white mt-4">{{$t('title.Receipt Printer')}}</h1>

          <div class="flex flex-col gap-3 px-6 py-4">
            <div>
              <label class="block text-base font-bold mb-2">{{$t('label.Epson Ip Address')}}</label>
              <el-input v-model="cashierForm.ip" placeholder="192.168.1.xxx" />
              <div class="flex justify-between flex-wrap px-1 text-sm text-right opacity-85">
                <span></span>
                <span>({{$t('label.Example')}}: 192.168.1.xxx)</span>
              </div>
            </div>
          </div>
          
          <h1 class="flex items-center justify-between text-xl text-white my-4">
            <span>{{$t('title.Receipt')}}</span>
            <div>
              <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
                <el-button class="!block ml-auto" type="success" plain disabled>{{$t('label.Print Sample')}}</el-button>
              </el-tooltip>
              <el-button v-else class="!block ml-auto" type="success" :loading="loading.printReceipt" plain @click="printReceipt">{{$t('label.Print Sample')}}</el-button>
            </div>
          </h1>

          <div class="flex items-center flex-col py-6">
            <div id="receipt">
              <img src="@/public/test1.png" />

              <br/>

              <div v-for="header in cashierForm.header" :key="header" class="line" 
              :class="{'align-left': header.align === 'left', 'align-center': header.align === 'center', 'align-right': header.align === 'right',
                      'font-1': header.size === 1, 'font-2': header.size === 2, 'font-3': header.size === 3}">{{header.text}}</div>
              
              <br/>

              <div v-for="item in items" :key="item" >
                <div class="table-line">
                  <div class="product-name">{{item.name}}</div>
                  <div class="price">{{item.total}}</div>
                </div>

                <div v-if="item.discount > 0" class="line">{{`&nbsp;&nbsp;(${item.qty} @ ${item.price} ea) | Discount ${item.discount}%`}}</div>
                <div v-else-if="item.qty > 1" class="line">{{`&nbsp;&nbsp;(${item.qty} @ ${item.price} ea)`}}</div>
              </div>

              <br/>

              <div class="table-line">
                <div class="output-name">SAVINGS:</div>
                <div class="price">25.00</div>
              </div>
              <div class="table-line">
                <div class="output-name">SUBTOTAL:</div>
                <div class="price">475.00</div>
              </div>
              <div class="table-line">
                <div class="output-name">TAX(10.00%):</div>
                <div class="price">4.75</div>
              </div>
              <div class="table-line bold">
                <div class="output-name">TOTAL:</div>
                <div class="price">479.75</div>
              </div>
              <br/>
              <div class="table-line bold">
                <div class="output-name">MASTERCARD:</div>
                <div class="price">479.75</div>
              </div>
              <br/>

              <div v-for="footer in cashierForm.footer" :key="footer" class="line" 
              :class="{'align-left': footer.align === 'left', 'align-center': footer.align === 'center', 'align-right': footer.align === 'right',
                      'font-1': footer.size === 1, 'font-2': footer.size === 2, 'font-3': footer.size === 3}">{{footer.text}}</div>
            </div>
          </div>

          <div v-if="isBossAccount" id="receipt-wrapper">
            <div class="w-full">
              <label class="flex items-center justify-between text-base font-bold mb-2">
                <span>{{$t('label.Receipt Header')}}</span>
                <el-button type="success" plain @click="addHeader()">{{$t('label.Add Header')}}</el-button>
              </label>

              <div v-for="(header, h) in cashierForm.header" :key="header">
                <div class="input">
                  <div>
                    <label>{{$t('label.Font Size')}}</label>
                    <el-select v-model="header.size" :placeholder="$t(`label.Select`)">
                      <el-option v-for="i in [1, 2, 3]" :key="i" :label="i" :value="i" />
                    </el-select>
                  </div>

                  <div>
                    <label>{{$t('label.Text Alignment')}}</label>
                    <el-select v-model="header.align" :placeholder="$t(`label.Select`)">
                      <el-option v-for="i in ['left', 'center', 'right']" :key="i" :label="i.charAt(0).toUpperCase() + i.substring(1).toLowerCase()" :value="i" />
                    </el-select>
                  </div>

                  <div class="flex-auto">
                    <label>{{$t('label.Text')}}</label>
                    <el-input v-model="header.text">
                      <template v-if="h > 0" #append>
                        <el-button @click="removeItem(cashierForm.header, h)">
                          <Icon class="text-base text-red-500" name="material-symbols:delete-rounded" />
                        </el-button>
                      </template>
                    </el-input>
                  </div>
                </div>
              </div>
            </div>

            <div class="w-full">
              <label class="flex items-center justify-between text-base font-bold mb-2">
                <span>{{$t('label.Receipt Footer')}}</span>
                <el-button type="success" plain @click="addFooter()">{{$t('label.Add Footer')}}</el-button>
              </label>

              <div v-for="(footer, f) in cashierForm.footer" :key="f">
                <div class="input">
                  <div>
                    <label>{{$t('label.Font Size')}}</label>
                    <el-select v-model="footer.size" :placeholder="$t(`label.Select`)">
                      <el-option v-for="i in [1, 2, 3]" :key="i" :label="i" :value="i" />
                    </el-select>
                  </div>

                  <div>
                    <label>{{$t('label.Text Alignment')}}</label>
                    <el-select v-model="footer.align" :placeholder="$t(`label.Select`)">
                      <el-option v-for="i in ['left', 'center', 'right']" :key="i" :label="$t(`label.${i.charAt(0).toUpperCase()}${i.substring(1).toLowerCase()}`)" :value="i" />
                    </el-select>
                  </div>

                  <div class="flex-auto">
                    <label>{{$t('label.Text')}}</label>
                    <el-input v-model="footer.text">
                      <template v-if="f > 0" #append>
                        <el-button @click="removeItem(cashierForm.footer, f)">
                          <Icon class="text-base text-red-500" name="material-symbols:delete-rounded" />
                        </el-button>
                      </template>
                    </el-input>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="py-6">
            <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
              <el-button class="!block ml-auto" type="success" plain disabled>{{$t('label.Save')}}</el-button>
            </el-tooltip>
            <el-button v-else class="!block ml-auto" type="success" :loading="loading.saveCashier" plain @click="saveCashierSettings">{{$t('label.Save')}}</el-button>
          </div>
        </div>
      </div>

      <div v-if="storeId && tab === 'invoice'" class="tab">
        <div class="pt-8 pb-4">
          <h1 class="text-xl text-white">{{$t('title.Invoice')}}</h1>

          <div class="flex flex-col gap-3 px-6 py-4">
            <label class="flex items-center justify-between text-base font-bold">
              <span>{{$t('label.Notes')}}</span>
              <el-button type="success" plain @click="addNote()">{{$t('label.add')}}</el-button>
            </label>
            <p class="text-sm -mt-3 mb-1 opacity-85">{{$t('text.Standard messages to be included on all invoices')}}</p>

            <div class="flex flex-col gap-4">
              <div v-for="(note, i) in cashierForm.invoice_notes" :key="i">
                <div class="flex items-center justify-center gap-4">
                  <div>
                    <label class="block pb-4">{{$t('label.Bold')}}</label>
                    <el-checkbox class="flex items-center justify-center w-8 position-relative bottom-1" v-model="note.bold" style="transform: scale(1.6);" />
                  </div>

                  <div class="w-full">
                    <label class="block pb-2">{{$t('label.Text')}}</label>
                    <el-input v-model="note.text">
                      <template v-if="i > 0" #append>
                        <el-button @click="removeItem(cashierForm.invoice_notes, i)">
                          <Icon class="text-base text-red-500" name="material-symbols:delete-rounded" />
                        </el-button>
                      </template>
                    </el-input>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="py-6">
            <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
              <el-button class="!block ml-auto" type="success" plain disabled>{{$t('label.Save')}}</el-button>
            </el-tooltip>
            <el-button v-else class="!block ml-auto" type="success" :loading="loading.saveCashier" plain @click="saveCashierSettings">{{$t('label.Save')}}</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup>
definePageMeta({
  middleware: ['unauth', 'language']
})

const { fetch } = useUserSession()
const { $switchLocale, $t } = useNuxtApp()
const { handleGetRequest, handleInventoryRequest } = useHandleRequests()
const { getAuthUser } = useAuth()
const { sendNotification, sendFrontendNotification } = useHelpers()
const { validateUsername, validateOptionalEmail } = useValidator()
const { isBoss } = useChecks()
const { formatNameColumn, formatPriceColumn, formatQuantityColumn, formatDiscountColumn, formatCostColumn } = useFormatter()
const hash = computed(() => { return window.location.hash.replace('#', '') || '' })

//Store
const pinia = useStore()
const offlineStore = useOfflineStore()
const isBossAccount = computed(isBoss)
const tabOptions = ['account', 'preference', 'api', 'columns', 'receipt', 'invoice']

const loading = reactive({startedLoading: true, saveUser: false, updatePassword: false, linkColumns: false, printReceipt: false, saveCashier: false, regenerateKey: false})
const tab = ref('account')
const user = ref(getAuthUser())
const userForm = ref(null)
const passwordForm = ref(null)
const form = reactive({
  username: user.value.username,
  name: user.value.name,
  password1: '',
  password2: '',
  email: user.value.email,
  language: user.value.language,
  seePassword: false,
  showApiKey: false
})
const userRules = reactive({
  username: [
    { required: true, message: $t('invalid.Username is required'), trigger: ['blur', 'change'] },
    { min: 3, max: 15, message: $t('invalid.Username must be between 3 and 15 characters'), trigger: ['blur', 'change'] },
    { validator: validateUsername, trigger: 'change' }
  ],
  name: [
    { required: true, message: $t('invalid.Name is required'), trigger: ['blur', 'change'] }
  ],
  email: [
    { required: true, message: $t('invalid.Email is required'), trigger: ['blur', 'change'] },
    { type: 'email', message: $t('invalid.Invalid email format'), trigger: ['blur', 'change'] }
  ],
})

const passwordRules = reactive({
  password1: [
    { min: 6, message: $t('invalid.Password must be at least 6 characters'), trigger: 'blur' }
  ],
  password2: [
    { min: 6, message: $t('invalid.Password must be at least 6 characters'), trigger: 'blur' }
  ],
})

const storeId = computed(pinia.getStore)
const store = ref(null)
const columnForm = reactive({
  name: '',
  price: '',
  quantity: '',
  discount: '',
  cost: '',
})

const cashierForm = reactive({
  tax: 0,
  ip: user.value.ip,
  header: [{text: '', align: 'left', size: 1}],
  footer: [{text: '', align: 'left', size: 1}],
  invoice_notes: [{text: '', bold: false}],
})
const items = [{name: 'Product Name', qty: 1, price: '100.00', discount: 0, discount_type: 'percent', total: '100.00'}, {name: 'Product Name', qty: 3, price: '50.00', discount: 0, discount_type: 'percent', total: '150.00'}, {name: 'Product Name', qty: 10, price: '25.00', discount: 10, discount_type: 'percent', total: '225.00'}]

//Mount
onBeforeMount(async () => {
  if(tabOptions.includes(hash.value)) {
    tab.value = hash.value
    const baseUrl = window.location.href.split('#')[0]
    window.history.replaceState(window.history.state || {}, '', baseUrl)
  }

  await fetchStore()
  loading.startedLoading = false
  // console.log(JSON.stringify(user.value))
})

async function saveUser() {
  userForm.value.validate(async (valid) => {
    if (valid) {
      const { username, name, email } = form
      //Make request
      loading.saveUser = true
      const response = await useFetchApi(`/api/protected/settings/edit-user`, {
        method: "POST",
        body: { username: username, name: name, email: email }
      })
      loading.saveUser = false

      if (response.statusCode) {
        sendNotification(response.statusMessage, 'error')
        return
      }
      
      //Fetch updated auth data
      await fetch()
      sendNotification(response.message, 'success')
    }
  })
}

async function updatePassword() {
  passwordForm.value.validate(async (valid) => {
    if (valid) {
      const { password1, password2 } = form

      if(password1 !== password2) {
        sendFrontendNotification(`Passwords do not match`, 'error')
        return
      }

      //Make request
      loading.updatePassword = true
      const response = await useFetchApi(`/api/protected/settings/update-password`, {
        method: "POST",
        body: { password: password1 }
      })
      loading.updatePassword = false

      if (response.statusCode) {
        sendNotification(response.statusMessage, 'error')
        return
      }

      //Fetch updated auth data
      await fetch()
      form.password1 = ''
      form.password2 = ''
      sendNotification(response.message, 'success')
    }
  })
}

async function saveUserSettings() {
  //Make request
  const response = await useFetchApi(`/api/protected/settings/edit-user-settings`, {
    method: "POST",
    body: { language: form.language }
  })

  //Fetch updated auth data
  await fetch()

  //Switch language
  $switchLocale(form.language)

  sendNotification(response.message, 'success')
}

function copyApiKey() {
  if (user.value.api_key) {
    navigator.clipboard.writeText(user.value.api_key)
    sendNotification('API key copied!', 'success')
  }
}

async function regenerateApiKey() {
  // Show confirmation dialog if user already has an API key
  if (user.value.api_key) {
    try {
      await ElMessageBox.confirm(
        $t('text.Regenerating will invalidate your current API key'),
        $t('title.Regenerate API Key'),
        {
          confirmButtonText: $t('label.Regenerate'),
          cancelButtonText: $t('label.cancel'),
          type: 'warning'
        }
      )
    } catch {
      return // User cancelled
    }
  }

  loading.regenerateKey = true
  const response = await useFetchApi(`/api/protected/settings/edit-user-settings`, {
    method: "POST",
    body: { regenerate: true }
  })
  loading.regenerateKey = false

  if (response.statusCode) {
    sendNotification(response.statusMessage, 'error')
    return
  }

  //Fetch updated auth data
  await fetch()
  user.value = getAuthUser()

  sendNotification('API key generated!', 'success')
}

//Gets the user store
async function fetchStore() {
  if(storeId.value) {
    store.value = await handleGetRequest(`/api/protected/store/${storeId.value}`)

    const { tax, inventory, header, footer, invoice_notes } = store.value
    const { name_column, price_column, quantity_column, discount_column, cost_column } = inventory

    //Columns
    columnForm.name = name_column
    columnForm.price = price_column
    columnForm.quantity = quantity_column
    columnForm.discount = discount_column
    columnForm.cost = cost_column

    //Cashier
    cashierForm.tax = tax
    if(header)
      cashierForm.header = header
    if(footer)
      cashierForm.footer = footer
    if(invoice_notes)
      cashierForm.invoice_notes = invoice_notes
  }

  //Test data
  // console.log(JSON.stringify(store.value))
}

// COLUMNS //
async function linkColumns() {
  const { name, price, quantity, discount, cost } = columnForm
  let stock = store.value.inventory.stock

  if(!name || !price) {
    sendFrontendNotification('The Name and Price columns are mandatory for saving', 'warning')
    return
  }

  //Format data
  for (let key in stock) {
    //Required
    stock[key][name] = formatNameColumn(stock[key][name])
    stock[key][price] = formatPriceColumn(stock[key][price])
    //Optional
    if (quantity)
      stock[key][quantity] = formatQuantityColumn(stock[key][quantity])
    if (discount)
      stock[key][discount] = formatDiscountColumn(stock[key][discount])
    if (cost)
      stock[key][cost] = formatCostColumn(stock[key][cost])
  }

  //Make inventory request
  loading.linkColumns = true
  const inventory = await handleInventoryRequest({
    path: 'register-columns',
    data: { store_id: storeId.value, stock: stock, name_column: name, price_column: price, quantity_column: quantity, discount_column: discount, cost_column: cost },
  })

  if(inventory)
    store.value.inventory = inventory

  //Loading complete
  loading.linkColumns = false
}
// COLUMNS //

// RECEIPT //
function removeItem(array, i) {
  array.splice(i, 1)
}

function addHeader() {
  cashierForm.header.push({text: '', align: 'left', size: 1})
}

function addFooter() {
  cashierForm.footer.push({text: '', align: 'left', size: 1})
}

//Print Test Receipt
async function printReceipt() {
  //Save cashier settings
  loading.printReceipt = true
  await saveCashierSettings(false)

  //Print test receipt
  const response = await useFetchApi(`/api/protected/transaction/print`, {
    method: "POST",
    body: {
      store_id: storeId.value,
      items: items,
      tax: '10.00',
      subtotal: '475.00',
      tax_total: '4.75',
      total: '479.75',
      savings: '25.00',
      cash: 0,
      card: 479.75,
      check: 0,
      card_type: 'mastercard',
      discount: 0,
      discount_type: 'percent'
    }
  })
  loading.printReceipt = false

  //Display error
  if (response.statusCode) {
    sendNotification(response.statusMessage, 'error')
    return
  }

  //Display Success
  sendNotification(response.message, 'success')
}
// RECEIPT //

// INVOICE //
function addNote() {
  cashierForm.invoice_notes.push({text: '', bold: false})
}
// INVOICE //

//Saves cashier settings
async function saveCashierSettings(notifyUser = true) {
  const { tax, ip, header, footer, invoice_notes } = cashierForm
  let response = null
  loading.saveCashier = true

  //Save new ip address
  response = await useFetchApi(`/api/protected/settings/edit-user-settings`, {
    method: "POST",
    body: { ip: ip }
  })

  //Fetch updated auth data
  await fetch()

  //Only boss can 
  if(isBossAccount.value) {
    //Check if tax is withing 0 to 100%
    if(tax < 0 || tax > 100) {
      sendFrontendNotification('The tax percentage must be between 0% and 100%', 'error')
      return
    }

    //Save settings before printing receipt
    response = await useFetchApi(`/api/protected/settings/edit-cashier-settings`, {
      method: "POST",
      body: {
        store_id: storeId.value,
        tax: tax,
        header: header,
        footer: footer,
        invoice_notes: invoice_notes,
      }
    })
  }
  loading.saveCashier = false

  //Display error
  if (response && response.statusCode) {
    sendNotification(response.statusMessage, 'error')
    return
  }

  //Display Success
  if(response && notifyUser)
    sendNotification(response.message, 'success')
}
</script>

<style lang="scss">
@media (max-width: 575px) {
  #settings-page {
    #settings-wrapper {
      padding-left: 80px;
    }
    #settings-sidebar {
      #sidebar-wrapper {
        text-align: center;
        width: 79px !important;
        .sidebar-item {
          justify-content: center;
          span {
            display: none;
          }
        }
      }
    }
  }
}

#settings-sidebar {
  position: fixed;
  top: 0;
  height: 100vh;
  z-index: 2;
  #sidebar-wrapper {
    height: 100vh;
    width: 179px;
    padding: 16px 8px;
    border-color: #2b2b2b;
    .sidebar-item {
      display: flex;
      align-items: center;
      gap: 16px;
      color: #bfbfbf;
      padding: 16px;
      font-size: 16px;
      height: 40px;
      border-radius: 8px;
      margin: 4px 0;
      user-select: none;
      &.is-disabled {
        color: #ffffff;
      }
      &:hover, &.active {
        background: #ffffff14;
        color: #ffffff;
      }
    }
  }
}

#settings-page {
  .tab {
    padding: 0 16px 0 16px;
    max-width: 600px;
    width: 100%;
  }
  //el-input-number
  .el-input__suffix-inner > :first-child {
    margin-left: 0;
  }

  .input {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    padding: 8px 4px;
    label {
      display: block;
      padding-bottom: 8px;
    }
  }

  #receipt-wrapper {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 10px;
  }

  #receipt {
    width: 360px;
    height: fit-content;
    padding-bottom: 40px;
    background: white;
    font-family: 'Lucida Console';
    color: #000;
    img {
      display: block;
      margin: 20px auto 0 auto;
      max-width: 66%;
    }

    .line {
      width: 308px;
      font-size: 12px;
      margin: 0 auto;
    }

    .table-line {
      display: flex;
      justify-content: space-between;
      width: 308px;
      margin: 0 auto;
      font-size: 12px;
      .product-name {
        width: 200px;
        word-break: break-all;
      }
      .price {
        text-align: right;
        width: 90px;
        word-break: break-all;
      }
      .output-name {
        width: 175px;
        text-align: right;
      }
    }

    .bold {
      font-weight: bold;
    }

    .font-1 {
      width: 290px;
      font-size: 10px;
    }

    .font-2 {
      font-size: 12px;
    }

    .font-3 {
      font-size: 18px;
    }

    .align-left {
      text-align: left;
    }

    .align-center {
      text-align: center;
    }

    .align-right {
      text-align: right;
    }
  }
}

</style>