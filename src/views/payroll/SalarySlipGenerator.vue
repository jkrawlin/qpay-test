<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        <v-icon left>mdi-file-document-outline</v-icon>
        Salary Slip Generator
      </v-card-title>

      <v-card-text>
        <!-- Selection Controls -->
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedEmployee"
              :items="employees"
              item-title="name"
              item-value="id"
              label="Select Employee"
              prepend-icon="mdi-account"
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedMonth"
              :items="months"
              label="Select Month"
              prepend-icon="mdi-calendar-month"
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedYear"
              :items="years"
              label="Select Year"
              prepend-icon="mdi-calendar"
            ></v-select>
          </v-col>
        </v-row>

        <!-- Salary Slip Preview -->
        <v-card v-if="salaryData" ref="salarySlipContent" class="salary-slip mt-4" elevation="0" outlined>
          <div class="company-header pa-4 text-center">
            <h2>{{ companyInfo.name }}</h2>
            <p>{{ companyInfo.address }}</p>
            <p>Phone: {{ companyInfo.phone }} | Email: {{ companyInfo.email }}</p>
            <p>CR Number: {{ companyInfo.crNumber }}</p>
          </div>

          <v-divider></v-divider>

          <div class="slip-header pa-4 text-center">
            <h3>SALARY SLIP</h3>
            <p>Pay Period: {{ selectedMonth }} {{ selectedYear }}</p>
          </div>

          <v-divider></v-divider>

          <!-- Employee Information -->
          <div class="pa-4">
            <v-row>
              <v-col cols="6">
                <table class="info-table">
                  <tr>
                    <td><strong>Employee Name:</strong></td>
                    <td>{{ salaryData.employeeName }}</td>
                  </tr>
                  <tr>
                    <td><strong>Employee ID:</strong></td>
                    <td>{{ salaryData.employeeId }}</td>
                  </tr>
                  <tr>
                    <td><strong>Department:</strong></td>
                    <td>{{ salaryData.department }}</td>
                  </tr>
                  <tr>
                    <td><strong>Position:</strong></td>
                    <td>{{ salaryData.position }}</td>
                  </tr>
                </table>
              </v-col>
              <v-col cols="6">
                <table class="info-table">
                  <tr>
                    <td><strong>Qatar ID:</strong></td>
                    <td>{{ salaryData.qatarId }}</td>
                  </tr>
                  <tr>
                    <td><strong>Working Days:</strong></td>
                    <td>{{ salaryData.workingDays }}</td>
                  </tr>
                  <tr>
                    <td><strong>Present Days:</strong></td>
                    <td>{{ salaryData.presentDays }}</td>
                  </tr>
                  <tr>
                    <td><strong>Bank Account:</strong></td>
                    <td>{{ salaryData.bankAccount }}</td>
                  </tr>
                </table>
              </v-col>
            </v-row>
          </div>

          <v-divider></v-divider>

          <!-- Earnings and Deductions -->
          <div class="pa-4">
            <v-row>
              <v-col cols="6">
                <h4 class="mb-2">Earnings</h4>
                <table class="earnings-table">
                  <tr>
                    <td>Basic Salary</td>
                    <td class="text-right">QAR {{ formatCurrency(salaryData.basicSalary) }}</td>
                  </tr>
                  <tr>
                    <td>Housing Allowance</td>
                    <td class="text-right">QAR {{ formatCurrency(salaryData.housingAllowance) }}</td>
                  </tr>
                  <tr>
                    <td>Transport Allowance</td>
                    <td class="text-right">QAR {{ formatCurrency(salaryData.transportAllowance) }}</td>
                  </tr>
                  <tr>
                    <td>Food Allowance</td>
                    <td class="text-right">QAR {{ formatCurrency(salaryData.foodAllowance) }}</td>
                  </tr>
                  <tr v-if="salaryData.overtime > 0">
                    <td>Overtime</td>
                    <td class="text-right">QAR {{ formatCurrency(salaryData.overtime) }}</td>
                  </tr>
                  <tr v-if="salaryData.bonus > 0">
                    <td>Bonus</td>
                    <td class="text-right">QAR {{ formatCurrency(salaryData.bonus) }}</td>
                  </tr>
                  <tr class="font-weight-bold">
                    <td>Total Earnings</td>
                    <td class="text-right">QAR {{ formatCurrency(salaryData.totalEarnings) }}</td>
                  </tr>
                </table>
              </v-col>
              
              <v-col cols="6">
                <h4 class="mb-2">Deductions</h4>
                <table class="deductions-table">
                  <tr v-if="salaryData.advanceLoan > 0">
                    <td>Advance Loan</td>
                    <td class="text-right">QAR {{ formatCurrency(salaryData.advanceLoan) }}</td>
                  </tr>
                  <tr v-if="salaryData.absence > 0">
                    <td>Absence Deduction</td>
                    <td class="text-right">QAR {{ formatCurrency(salaryData.absence) }}</td>
                  </tr>
                  <tr v-if="salaryData.otherDeductions > 0">
                    <td>Other Deductions</td>
                    <td class="text-right">QAR {{ formatCurrency(salaryData.otherDeductions) }}</td>
                  </tr>
                  <tr v-if="!salaryData.advanceLoan && !salaryData.absence && !salaryData.otherDeductions">
                    <td>No Deductions</td>
                    <td class="text-right">QAR 0.00</td>
                  </tr>
                  <tr class="font-weight-bold">
                    <td>Total Deductions</td>
                    <td class="text-right">QAR {{ formatCurrency(salaryData.totalDeductions) }}</td>
                  </tr>
                </table>
              </v-col>
            </v-row>
          </div>

          <v-divider></v-divider>

          <!-- Net Salary -->
          <div class="pa-4 text-center">
            <h3>Net Salary: QAR {{ formatCurrency(salaryData.netSalary) }}</h3>
            <p class="text-caption">{{ numberToWords(salaryData.netSalary) }} Qatari Riyals Only</p>
          </div>

          <!-- Footer -->
          <div class="pa-4 text-center text-caption">
            <p>This is a computer-generated document. No signature is required.</p>
            <p>Generated on: {{ formatDate(new Date()) }}</p>
          </div>
        </v-card>

        <!-- Action Buttons -->
        <v-row v-if="salaryData" class="mt-4">
          <v-col cols="12" class="text-center">
            <v-btn color="primary" @click="downloadPDF" class="mr-2">
              <v-icon left>mdi-download</v-icon>
              Download PDF
            </v-btn>
            <v-btn color="secondary" @click="printSlip" class="mr-2">
              <v-icon left>mdi-printer</v-icon>
              Print
            </v-btn>
            <v-btn color="info" @click="emailSlip">
              <v-icon left>mdi-email</v-icon>
              Email to Employee
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { payrollService } from '@/services/payrollService'
import html2pdf from 'html2pdf.js'
import { format } from 'date-fns'

const selectedEmployee = ref('')
const selectedMonth = ref(format(new Date(), 'MMMM'))
const selectedYear = ref(new Date().getFullYear())
const salaryData = ref<any>(null)
const salarySlipContent = ref<HTMLElement>()

const employees = computed(() => [
  { id: 'EMP001', name: 'Ahmed Hassan Ali' },
  { id: 'EMP002', name: 'Sarah Ahmed Mohamed' },
  { id: 'EMP003', name: 'Rajesh Kumar Singh' },
  { id: 'EMP004', name: 'Maria Santos Silva' },
  { id: 'EMP005', name: 'John Michael Smith' }
])

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => currentYear - i)
})

const companyInfo = {
  name: 'Nipon Manpower Services',
  address: 'Building 123, Street 456, Doha, Qatar',
  phone: '+974 4444 5555',
  email: 'info@niponservices.qa',
  crNumber: 'CR-123456'
}

watch([selectedEmployee, selectedMonth, selectedYear], async () => {
  if (selectedEmployee.value) {
    await loadSalaryData()
  }
})

const loadSalaryData = async () => {
  try {
    // Mock salary data - replace with actual service call
    salaryData.value = {
      employeeName: employees.value.find(e => e.id === selectedEmployee.value)?.name || '',
      employeeId: selectedEmployee.value,
      department: 'Construction',
      position: 'Site Engineer',
      qatarId: '12345678901',
      workingDays: 30,
      presentDays: 28,
      bankAccount: '****1234',
      basicSalary: 8500,
      housingAllowance: 2125,
      transportAllowance: 850,
      foodAllowance: 500,
      overtime: 1200,
      bonus: 0,
      totalEarnings: 13175,
      advanceLoan: 650,
      absence: 340,
      otherDeductions: 125,
      totalDeductions: 1115,
      netSalary: 12060
    }
  } catch (error) {
    console.error('Failed to load salary data:', error)
  }
}

const formatCurrency = (amount: number) => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const formatDate = (date: Date) => {
  return format(date, 'dd/MM/yyyy')
}

const numberToWords = (num: number): string => {
  // Simplified number to words conversion
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  
  if (num === 0) return 'Zero'
  
  // Simplified conversion for demonstration
  const thousands = Math.floor(num / 1000)
  const remainder = num % 1000
  const hundreds = Math.floor(remainder / 100)
  const tensAndOnes = remainder % 100
  
  let result = ''
  
  if (thousands > 0) {
    result += `${ones[thousands]} Thousand `
  }
  
  if (hundreds > 0) {
    result += `${ones[hundreds]} Hundred `
  }
  
  if (tensAndOnes >= 10 && tensAndOnes < 20) {
    result += teens[tensAndOnes - 10]
  } else {
    const tensDigit = Math.floor(tensAndOnes / 10)
    const onesDigit = tensAndOnes % 10
    
    if (tensDigit > 0) {
      result += tens[tensDigit] + ' '
    }
    
    if (onesDigit > 0) {
      result += ones[onesDigit]
    }
  }
  
  return result.trim()
}

const downloadPDF = () => {
  const element = salarySlipContent.value
  const opt = {
    margin: 10,
    filename: `salary_slip_${selectedEmployee.value}_${selectedMonth.value}_${selectedYear.value}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }
  
  html2pdf().set(opt).from(element).save()
}

const printSlip = () => {
  window.print()
}

const emailSlip = async () => {
  try {
    // Implementation for emailing the slip
    await payrollService.emailSalarySlip(salaryData.value)
    alert('Salary slip sent successfully!')
  } catch (error) {
    console.error('Failed to send email:', error)
    alert('Failed to send salary slip')
  }
}
</script>

<style scoped>
.salary-slip {
  background: white;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.company-header {
  background: #f5f5f5;
  border-radius: 4px;
}

.info-table,
.earnings-table,
.deductions-table {
  width: 100%;
  border-collapse: collapse;
}

.info-table td,
.earnings-table td,
.deductions-table td {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.earnings-table tr:last-child td,
.deductions-table tr:last-child td {
  border-bottom: none;
  border-top: 2px solid #333;
  padding-top: 10px;
}

@media print {
  .v-card-actions,
  .v-row:last-child {
    display: none;
  }
  
  .salary-slip {
    box-shadow: none;
  }
}
</style>