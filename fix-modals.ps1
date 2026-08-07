$files = Get-ChildItem -Path 'src\app\(dashboard)' -Recurse -Filter *.tsx

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Check if file has a modal that needs fixing
    if ($content -match 'fixed inset-0.*?flex items-center justify-center') {
        # Replace the container classes
        $newContent = $content -replace 
            '(className="fixed inset-0[^"]*?)flex items-center justify-center(.*?)"', 
            '$1flex items-start justify-center overflow-y-auto sm:pt-10 $2"'
            
        # Optional: ensure z-[100] is there if z-50 is used
        $newContent = $newContent -replace 'z-50', 'z-[100]'
        
        # Add shrink-0 and mb-10 to the immediate child div (usually bg-white)
        # This is harder with regex, but we can do a simple replace for 'bg-white rounded' -> 'bg-white rounded-xl shadow-2xl shrink-0 mb-10 '
        # Actually, just adding overflow-y-auto and flex items-start sm:pt-10 is 90% of the fix.
        # Let's also add ' mb-10 shrink-0' to 'max-w-md' or 'max-w-lg'
        $newContent = $newContent -replace 'max-w-lg overflow-hidden"', 'max-w-lg overflow-hidden shrink-0 my-10"'
        $newContent = $newContent -replace 'max-w-md"', 'max-w-md shrink-0 my-10"'
        $newContent = $newContent -replace 'max-w-xl"', 'max-w-xl shrink-0 my-10"'
        $newContent = $newContent -replace 'max-w-2xl"', 'max-w-2xl shrink-0 my-10"'
        
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Fixed modal in $($file.Name)"
    }
}
