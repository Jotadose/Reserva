# Script para crear estructura de carpetas SaaS
$folders = @(
    "src/app/(auth)/register",
    "src/app/(dashboard)/[tenant]/dashboard",
    "src/app/(dashboard)/[tenant]/bookings",
    "src/app/(dashboard)/[tenant]/clients",
    "src/app/(dashboard)/[tenant]/services",
    "src/app/(dashboard)/[tenant]/settings",
    "src/app/(public)/[tenant]/book",
    "src/app/(public)/pricing",
    "src/app/api/auth",
    "src/app/api/webhooks",
    "src/components/ui",
    "src/components/forms",
    "src/components/dashboard",
    "src/components/booking",
    "src/lib",
    "src/types",
    "src/hooks",
    "src/store"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Path $folder -Force
    Write-Host "Created: $folder"
}

Write-Host "All folders created successfully!"