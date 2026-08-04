$palettes = @(
    @{ Name = "Azul";    Bg1 = "#050B14"; Bg2 = "#0A1321" }, 
    @{ Name = "Bordo";   Bg1 = "#120406"; Bg2 = "#1A070A" }, 
    @{ Name = "Purpura"; Bg1 = "#0D0412"; Bg2 = "#15081A" }, 
    @{ Name = "Verde";   Bg1 = "#05120B"; Bg2 = "#0A1A10" }, 
    @{ Name = "Negro";   Bg1 = "#000000"; Bg2 = "#0A0A0A" }  
)

$sourceFile = "src/components/templates/MasterModernoTemplate.tsx"
$sourceContent = Get-Content $sourceFile -Raw

foreach ($p in $palettes) {
    $componentName = "ModernoTemplate" + $p.Name
    $fileName = "src/components/templates/$componentName.tsx"
    
    $content = $sourceContent
    
    # Reemplazar colores de fondo
    $content = $content -replace "(?i)#0F0E13", $p.Bg1
    $content = $content -replace "(?i)#1C1926", $p.Bg2
    
    # Reemplazar gradiente inicial del hero (from-[#12181A] via-[#161F22] to-[#0B1112])
    $content = $content -replace "(?i)from-\[#12181A\] via-\[#161F22\] to-\[#0B1112\]", "bg-[$($p.Bg1)]"
    
    # Reemplazar nombre del componente
    $content = $content -replace "ModernoTemplate", $componentName
    
    Set-Content $fileName $content
    Write-Host "Updated $fileName"
}

