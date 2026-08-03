$palettes = @(
    @{ Name = "";            P1 = "#C79A4B"; P2 = "#A37B5C"; P3 = "#D0B8A8"; P4 = "#EAE5D9"; P5 = "#1A1512" }, # Dorado (Default)
    @{ Name = "Green";       P1 = "#5C8A7A"; P2 = "#3E6152"; P3 = "#A8C1B7"; P4 = "#E5ECE9"; P5 = "#18241D" }, # Verde
    @{ Name = "Red";         P1 = "#8A4A54"; P2 = "#61333A"; P3 = "#C1979E"; P4 = "#EAE1E3"; P5 = "#24181A" }, # Rojo
    @{ Name = "Blue";        P1 = "#52718A"; P2 = "#384D5E"; P3 = "#A3B6C6"; P4 = "#E3E8EC"; P5 = "#171E24" }, # Azul
    @{ Name = "Orange";      P1 = "#B86A4C"; P2 = "#8A4F39"; P3 = "#D6A694"; P4 = "#F2EAE6"; P5 = "#241814" }, # Naranja
    @{ Name = "Violet";      P1 = "#7B6282"; P2 = "#58465D"; P3 = "#B5A4BA"; P4 = "#EAE7EB"; P5 = "#201A22" }, # Violeta
    @{ Name = "Gray";        P1 = "#70767B"; P2 = "#505457"; P3 = "#B1B6BA"; P4 = "#EBECED"; P5 = "#1E1F21" }, # Gris
    @{ Name = "DarkYellow";  P1 = "#B8964C"; P2 = "#8A7039"; P3 = "#D6BF94"; P4 = "#F2EFE6"; P5 = "#241F14" }, # Amarillo Oscuro
    @{ Name = "Pink";        P1 = "#A87082"; P2 = "#7E5361"; P3 = "#CDAAB7"; P4 = "#EFE8EA"; P5 = "#22181A" }  # Rosa
)

$sourceFile = "src/components/templates/DraftTemplate.tsx"
$sourceContent = Get-Content $sourceFile -Raw

foreach ($p in $palettes) {
    $componentName = "ElegantTemplate" + $p.Name
    $fileName = "src/components/templates/$componentName.tsx"
    
    $content = $sourceContent
    
    # Reemplazar colores hex
    $content = $content -replace '(?i)#C79A4B', $p.P1
    $content = $content -replace '(?i)#A37B5C', $p.P2
    $content = $content -replace '(?i)#D0B8A8', $p.P3
    $content = $content -replace '(?i)#EAE5D9', $p.P4
    $content = $content -replace '(?i)#1A1512', $p.P5
    
    # Reemplazar nombre del componente
    $content = $content -replace 'DraftTemplate', $componentName
    
    # Inyectar CSS variables al div principal
    # Buscar: <div className="desktop-stage" data-theme={theme}>
    $searchString = '<div className="desktop-stage" data-theme={theme}>'
    $replaceString = "<div className=`"desktop-stage`" data-theme={theme} style={{ '--t-acc': '$($p.P1)', '--t-acc2': '$($p.P1)', '--c-accent': '$($p.P1)' } as React.CSSProperties}>"
    $content = $content.Replace($searchString, $replaceString)
    
    Set-Content $fileName $content
    Write-Host "Created $fileName"
}
